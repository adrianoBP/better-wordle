'use strict';
import * as logService from './log.service.js';
import { resetKeyboard, selectKey, unselectKey } from './keyboard.service.js';
import { validateGuess } from './api.service.js';
import { getDayFromMillisec } from './common.service.js';
import { getSetting, setSetting } from './storage.service.js';
import Game from '../components/game/Game.js';

const dictionaryOptions = {
  difficulty: 1,
  wordLength: 5,
  allowedGuessesCount: 6,
  gameTime: Date.now(),
  hash: null, // used to restart the game with a different word for the same day - hash should generated on the server
};

let mainGame = null;

const startGame = () => {
  mainGame = new Game(dictionaryOptions);
  loadGame();
};

const resetGame = () => {
  mainGame.restart();
  resetKeyboard();
};

const checkInput = async (input) => {
  // TODO: do not accept input if it is still validating

  // TODO: CTRL + Backspace deletes the whole word

  // Don't accept any inputs if the word is already guessed or the number of guesses has been reached
  if (!mainGame.board.canInsert() || mainGame.isValidating) return;

  input = input.toLowerCase();

  // If the input is a letter
  if (/^[a-z]{1,1}$/.test(input)) {
    if (mainGame.board.canAcceptLetter()) {
      mainGame.board.addLetter(input);
      selectKey(input);

      // If we reached the end of the word, check if it is a valid word
      if (mainGame.board.wordLengthReached()) {
        mainGame.validateGuess();
      }
    }

    return;
  }

  // If the input is a backspace
  if (input === 'backspace') {
    const removedLetter = mainGame.board.removeLetter();
    const currentGuess = mainGame.board.getCurrentGuess();

    // Unselect only if it is the last occurrence in the guess
    if (!currentGuess.includes(removedLetter)) { unselectKey(removedLetter); }

    return;
  }

  // If the input is enter
  if (input === 'enter' && mainGame.board.wordLengthReached()) {
    const guess = mainGame.board.getCurrentGuess();

    if (!mainGame.isGuessValid) {
      // Wiggle the word so that the user is aware that the word is invalid
      mainGame.board.wiggleWord();
      logService.error('Word is not valid');
      return;
    }

    const validationResponse = await validateGuess(guess);
    if (validationResponse.error) {
      logService.error(validationResponse.error);
      return;
    }

    await mainGame.applyValidationResult(guess.join(''), validationResponse.result.validation, true);

    // If we have a hash, it means that we are playing a custom game, hence, we don't want to store the game
    if (!dictionaryOptions.hash) { saveGame(); }
  }
};

const saveGame = () => {
  const gameSettings = {
    gameboard: mainGame.board.details,
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
  if (savedGameSettings.dictionaryOptions.wordLength !== dictionaryOptions.wordLength) {
    clearGameSettings();
    return;
  }

  // If the game settings are the same, load
  if (!savedGameSettings.gameboard) {
    clearGameSettings();
    return;
  }

  mainGame.load(savedGameSettings);
};

const clearGameSettings = () => {
  dictionaryOptions.hash = null;
  dictionaryOptions.gameTime = Date.now();
  saveGame();
};


export {
  dictionaryOptions,

  startGame,
  resetGame,

  saveGame,
  loadGame,

  checkInput,
};
