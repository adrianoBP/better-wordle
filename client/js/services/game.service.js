'use strict';
import * as logService from './log.service.js';
import * as animationService from './animation.service.js';
import { updateKeyboard, selectKey, unselectKey } from './ui.service.js';
import { validateWord, validateGuess } from './api.service.js';
import { sleep } from './common.service.js';

const gameBoard = [];
const guessedLetters = {
  success: [],
  warn: [],
  fail: [],
};
const dictionaryOptions = {
  lang: 'en_en',
  wordLength: 5,
};

let currentWordIndex = 0;
let currentLetterIndex = 0;
let wordGuessed = false;

function resetGame() {
  gameBoard.splice(0, gameBoard.length);
  guessedLetters.success.splice(0, guessedLetters.success.length);
  guessedLetters.warn.splice(0, guessedLetters.warn.length);
  guessedLetters.fail.splice(0, guessedLetters.fail.length);
}

function initGameBoard() {
  resetGame();

  const boardElement = document.querySelector('#board');
  boardElement.replaceChildren([]);

  // Create rows of words
  for (let i = 0; i < 6; i++) {
    gameBoard.push([]);
    // Create characters for each word
    for (let j = 0; j < dictionaryOptions.wordLength; j++) {
      const charElement = document.createElement('div');
      gameBoard[i].push(charElement);
      boardElement.appendChild(charElement);
    }
  }
}

function getCurrentGuess() {
  return gameBoard[currentWordIndex].map((el) => el.textContent);
}

async function checkInput(input) {
  // TODO: CTRL + Backspace deletes the whole word

  // Don't accept any inputs if the word is already guessed
  if (wordGuessed) return;

  input = input.toLowerCase();

  if (/^[a-z]{1,1}$/.test(input)) {
    // Letter pressed
    if (currentLetterIndex < dictionaryOptions.wordLength) {
      gameBoard[currentWordIndex][currentLetterIndex].textContent =
                input;
      currentLetterIndex++;
      selectKey(input);
    } else {
      logService.warn('Word is already complete');
    }
  } else if (
    ['backspace', '←'].includes(input) &&
        currentLetterIndex > 0
  ) {
    // Backspace pressed
    currentLetterIndex--;
    const currentLetterElement = gameBoard[currentWordIndex][currentLetterIndex];

    // Unselect only if it is the last occurrence
    const guess = getCurrentGuess();
    if (guess.filter((el) => el === currentLetterElement.textContent).length === 1) {
      unselectKey(currentLetterElement.textContent);
    }
    gameBoard[currentWordIndex][currentLetterIndex].textContent = '';
  } else if (['enter', '↵'].includes(input)) {
    // Enter pressed
    if (currentLetterIndex < 5) {
      logService.error('Word is not complete');
      return;
    }

    const guess = getCurrentGuess();

    const wordValidationResult = await validateWord(guess.join(''));
    // TODO: validate response for errors
    if (!wordValidationResult.isValid) {
      // Wiggle the word so that the user is aware that the word is invalid
      gameBoard[currentWordIndex].forEach((el) => {
        animationService.shake(el);
      });
      logService.error('Word is not valid');
      return;
    }

    const validationResult = await validateGuess(guess);

    if (validationResult) {
      for (let i = 0; i < guess.length; i++) {
        const letter = validationResult[i];

        let classResult = '';

        if (letter === 1) {
          classResult = 'success';
          guessedLetters.success.push(guess[i]);

          if (guessedLetters.warn.includes(guess[i])) {
            guessedLetters.warn.splice(guessedLetters.warn.indexOf(guess[i]), 1);
          }
        } else if (letter === 0) {
          classResult = 'warn';
          if (!guessedLetters.success.includes(guess[i])) {
            guessedLetters.warn.push(guess[i]);
          }
        } else {
          classResult = 'fail';
          if (!guessedLetters.success.includes(guess[i]) && !guessedLetters.warn.includes(guess[i])
          ) {
            guessedLetters.fail.push(guess[i]);
          }
        }

        animationService.flip(gameBoard[currentWordIndex][i], classResult);
        await sleep(350);
      }

      updateKeyboard();

      currentWordIndex++;
      currentLetterIndex = 0;

      wordGuessed = validationResult.every((result) => result === 1);
    }
  }
}

export {
  gameBoard,
  guessedLetters,
  dictionaryOptions,

  initGameBoard,
  checkInput,
  getCurrentGuess,
};
