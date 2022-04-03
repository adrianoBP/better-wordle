'use strict';
import * as logService from './log.service.js';
import { selectKey, unselectKey } from './keyboard.service.js';
import { validateWord, validateGuess } from './api.service.js';
import { getDayFromMillisec } from './common.service.js';
import { getSetting, setSetting } from './storage.service.js';
import Gameboard from '../components/gameboard/Gameboard.js';

const dictionaryOptions = {
  lang: 'en_en',
  wordLength: 5,
  allowedGuessesCount: 6,
  gameTime: Date.now(),
  hash: null, // used to restart the game with a different word for the same day - hash should generated on the server
};

let gameBoard = null;

const startGame = () => {
  gameBoard = new Gameboard(dictionaryOptions);
  loadGame();
};

const checkInput = async (input) => {
  // TODO: CTRL + Backspace deletes the whole word

  // Don't accept any inputs if the word is already guessed or the number of guesses has been reached
  if (!gameBoard.canInsert()) return;

  input = input.toLowerCase();

  // If the input is a letter
  if (/^[a-z]{1,1}$/.test(input)) {
    if (gameBoard.canAcceptLetter()) {
      gameBoard.addLetter(input);
      selectKey(input);

      // If we reached the end of the word, check if it is a valid word
      if (gameBoard.wordLengthReached()) {
        const guess = gameBoard.getCurrentGuess();
        const wordValidationResult = await validateWord(guess.join(''));
        if (!wordValidationResult) {
          gameBoard.markCurrentWordInvalid();
        }
      }
    }

    return;
  }

  // If the input is a backspace
  if (input === 'backspace') {
    const removedLetter = gameBoard.removeLetter();
    const currentGuess = gameBoard.getCurrentGuess();

    // Unselect only if it is the last occurrence in the guess
    if (!currentGuess.includes(removedLetter)) { unselectKey(removedLetter); }

    return;
  }

  // If the input is enter
  if (input === 'enter' && gameBoard.wordLengthReached()) {
    const guess = gameBoard.getCurrentGuess();

    const wordValidationResult = await validateWord(guess.join(''));

    if (!wordValidationResult) {
      // Wiggle the word so that the user is aware that the word is invalid
      gameBoard.wiggleWord();
      logService.error('Word is not valid');
      return;
    }

    const validationResponse = await validateGuess(guess);
    if (validationResponse.error) {
      logService.error(validationResponse.error);
      return;
    }

    await gameBoard.applyValidationResult(validationResponse.result.validation, true);
    saveGame();
  }
};

const saveGame = () => {
  const gameSettings = {
    gameboard: gameBoard.details,
    dictionaryOptions,
  };

  setSetting('game-save', gameSettings);
};

const loadGame = () => {
  const savedGameSettings = getSetting('game-save');

  // If there are no settings, don't load
  if (!savedGameSettings) return;

  // If the game index changed, don't load
  if (getDayFromMillisec(savedGameSettings.dictionaryOptions.gameTime) !== getDayFromMillisec()) {
    clearGameSettings();
    return;
  }

  // If the game settings changed, don't load
  if (savedGameSettings.dictionaryOptions.wordLength !== dictionaryOptions.wordLength ||
    savedGameSettings.dictionaryOptions.lang !== dictionaryOptions.lang) {
    clearGameSettings();
    return;
  }

  // If the game settings are the same, load
  if (!savedGameSettings.gameboard) {
    clearGameSettings();
    return;
  }

  savedGameSettings.gameboard.forEach((row) => {
    // Convert the element type to a validation type (-1, 0, 1)
    row.forEach((letter) => {
      letter.value = letter.type === 'success' ? 1 : letter.type === 'warn' ? 0 : -1;
    });

    const validationResult = row.map((el) => el.value);
    gameBoard.addWord(row.map((el) => el.letter), validationResult);
  });
};

const clearGameSettings = () => {
  dictionaryOptions.hash = null;
  dictionaryOptions.gameTime = Date.now();
  saveGame();
};


export {
  dictionaryOptions,

  startGame,

  saveGame,
  loadGame,

  checkInput,
};
