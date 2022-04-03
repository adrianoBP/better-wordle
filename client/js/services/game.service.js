'use strict';
import * as logService from './log.service.js';
import { selectKey, unselectKey, saveKeyboard } from './keyboard.service.js';
import { validateWord, validateGuess } from './api.service.js';
import { allowLoading } from './common.service.js';
import { getSetting, setSetting } from './storage.service.js';
import Gameboard from '../components/gameboard/Gameboard.js';

const dictionaryOptions = {
  lang: 'en_en',
  wordLength: 5,
  allowedGuessesCount: 6,
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
    // TODO: check if this can be optimized

    // Unselect only if it is the last occurrence
    let currentGuess = gameBoard.getCurrentGuess();
    const lastLetter = currentGuess.filter((el) => el !== '').at(-1);
    gameBoard.removeLetter();
    currentGuess = gameBoard.getCurrentGuess();

    if (!currentGuess.includes(lastLetter)) { unselectKey(lastLetter); }

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

    const validationResult = await validateGuess(guess);
    await gameBoard.applyValidationResult(validationResult, true);

    saveGame();
  }
};

const saveGame = () => {
  setSetting('game-board', gameBoard.details);
  setSetting('save-game-time', new Date().toISOString());
  saveKeyboard();
};

const loadGame = () => {
  if (!allowLoading()) return;

  // Load game board
  const boardResults = getSetting('game-board');
  if (!boardResults) return;

  boardResults.forEach((row) => {
    // Convert the element type to a validation type (-1, 0, 1)
    row.forEach((letter) => {
      letter.value = letter.type === 'success' ? 1 : letter.type === 'warn' ? 0 : -1;
    });

    const validationResult = row.map((el) => el.value);
    gameBoard.addWord(row.map((el) => el.letter), validationResult);
  });
};

export {
  dictionaryOptions,

  startGame,

  saveGame,
  loadGame,

  checkInput,
};
