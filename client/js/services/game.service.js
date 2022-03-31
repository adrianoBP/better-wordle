'use strict';
import * as logService from './log.service.js';
import { getElementType } from './ui.service.js';
import { selectKey, unselectKey, saveKeyboard } from './keyboard.service.js';
import { validateWord, validateGuess } from './api.service.js';
import { allowLoading } from './common.service.js';
import { getSetting, setSetting } from './storage.service.js';
import * as boardService from './board.service.js';

const dictionaryOptions = {
  lang: 'en_en',
  wordLength: 5,
  allowedGuessesCount: 6,
};

let wordGuessed = false;

const checkInput = async (input) => {
  // TODO: CTRL + Backspace deletes the whole word

  // Don't accept any inputs if the word is already guessed or the number of guesses has been reached
  if (wordGuessed || !boardService.canAcceptWord()) return;

  input = input.toLowerCase();

  // If the input is a letter
  if (/^[a-z]{1,1}$/.test(input)) {
    if (boardService.canAcceptLetter()) {
      boardService.addLetter(input);
      selectKey(input);

      // If we reached the end of the word, check if it is a valid word
      if (boardService.wordLengthReached()) {
        const guess = boardService.getCurrentGuess();
        const wordValidationResult = await validateWord(guess.join(''));
        if (!wordValidationResult) {
          boardService.markCurrentWordInvalid();
        }
      }
    }

    return;
  }

  // If the input is a backspace
  if (input === 'backspace') {
    // TODO: check if this can be optimized

    // Unselect only if it is the last occurrence
    let currentGuess = boardService.getCurrentGuess();
    const lastLetter = currentGuess.filter((el) => el !== '').at(-1);
    boardService.removeLetter();
    currentGuess = boardService.getCurrentGuess();

    if (!currentGuess.includes(lastLetter)) { unselectKey(lastLetter); }

    return;
  }

  // If the input is enter
  if (input === 'enter') {
    const guess = boardService.getCurrentGuess();

    const wordValidationResult = await validateWord(guess.join(''));

    if (!wordValidationResult) {
      // Wiggle the word so that the user is aware that the word is invalid
      boardService.wiggleWord();
      logService.error('Word is not valid');
      return;
    }

    const validationResult = await validateGuess(guess);
    boardService.applyValidationResult(validationResult, true);

    // If all the letters are in the correct position, the user won the game
    if (validationResult.every((el) => el === 1)) wordGuessed = true;
  }
};

const saveGame = () => {
  const boardResults = [];
  boardService.gameBoard.forEach((row) => {
    const rowResults = [];
    row.forEach((el) => {
      if (el.textContent) {
        rowResults.push({
          letter: el.textContent,
          classResult: getElementType(el),
        });
      }
    });

    if (rowResults.length > 0) boardResults.push(rowResults);
  });

  setSetting('game-board', boardResults);
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
      letter.value = letter.classResult === 'success' ? 1 : letter.classResult === 'warn' ? 0 : -1;
    });

    const validationResult = row.map((el) => el.value);
    boardService.addWord(row.map((el) => el.letter), validationResult);
  });
};

export {
  dictionaryOptions,

  saveGame,
  loadGame,

  checkInput,
};
