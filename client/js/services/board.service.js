'use strict';
import { dictionaryOptions, saveGame } from './game.service.js';
import { sleep } from './common.service.js';
import * as animationService from './animation.service.js';
import { updateKeyboard } from './keyboard.service.js';

const gameBoard = [];
let currentWordIndex = 0;
let currentLetterIndex = 0;

const initBoard = () => {
  const boardElement = document.querySelector('#board');
  boardElement.replaceChildren([]);

  // Create rows of words
  for (let i = 0; i < dictionaryOptions.allowedGuessesCount; i++) {
    gameBoard.push([]);
    // Create characters for each word
    for (let j = 0; j < dictionaryOptions.wordLength; j++) {
      const charElement = document.createElement('div');
      gameBoard[i].push(charElement);
      boardElement.appendChild(charElement);
    }
  }
};

const getCurrentGuess = () => {
  return gameBoard[currentWordIndex].map((el) => el.textContent);
};

const canAcceptLetter = () => {
  return currentLetterIndex < dictionaryOptions.wordLength;
};

const wordLengthReached = () => {
  return currentLetterIndex === dictionaryOptions.wordLength;
};

const canAcceptWord = () => {
  return currentWordIndex < dictionaryOptions.allowedGuessesCount;
};

const addLetter = (letter) => {
  gameBoard[currentWordIndex][currentLetterIndex].textContent =
  letter;
  currentLetterIndex++;
};

const addWord = (word, validationResult) => {
  word.forEach((letter) => {
    addLetter(letter);
  });

  if (validationResult) applyValidationResult(validationResult);

  currentWordIndex++;
  currentLetterIndex = 0;
};

const removeLetter = () => {
  if (currentLetterIndex === 0) return;

  gameBoard[currentWordIndex].forEach(element => {
    element.classList.remove('error');
  });

  currentLetterIndex--;
  gameBoard[currentWordIndex][currentLetterIndex].textContent = '';
};

const applyValidationResult = async (validationResult, incrementWordIndex) => {
  // List of keyboard keys that need to be updated according to the validation result
  const keysToReload = [];
  const guess = getCurrentGuess();

  // We copy the index of the word as multiple validations could happen at the same time (i.e. game load)
  const wordToUpdateIndex = currentWordIndex;

  if (validationResult) {
    for (let i = 0; i < guess.length; i++) {
      const letter = validationResult[i];

      let classResult = '';

      if (letter === 1) classResult = 'success';
      else if (letter === 0) classResult = 'warn';
      else classResult = 'fail';

      keysToReload.push({ letter: guess[i], classResult });
      animationService.flip(gameBoard[wordToUpdateIndex][i], classResult);
      await sleep(350);
    }

    updateKeyboard(keysToReload);

    if (incrementWordIndex) {
      currentWordIndex++;
      currentLetterIndex = 0;

      // If we are not incrementing the word index, we are loading the game, hence, no need to save it again
      saveGame();
    }
  }
};

const markCurrentWordInvalid = () => {
  gameBoard[currentWordIndex].forEach(element => {
    element.classList.add('error');
  });
};

const wiggleWord = () => {
  gameBoard[currentWordIndex].forEach((el) => {
    animationService.shake(el);
  });
};

export {
  gameBoard,

  initBoard,
  getCurrentGuess,

  canAcceptLetter,
  canAcceptWord,
  wordLengthReached,

  addLetter,
  removeLetter,
  addWord,

  applyValidationResult,
  markCurrentWordInvalid,
  wiggleWord,
};
