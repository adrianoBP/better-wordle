'use strict';
import apiService from './services/api.service.js';
import logService from './services/log.service.js';

const SERVICE_URL = 'http://localhost:8080/api';

let rootElement;
let boardElement;
let boardElements = [];
let keyboardLetters = {};

const dictionaryOptions = {
  lang: 'en_en',
  wordLength: 5,
};

let currentWordIndex = 0;
let currentCharIndex = 0;
let wordGuessed = false;

const charGuesses = {
  success: [],
  warn: [],
  fail: [],
};

const getCurrentGuess = () => {
  return boardElements[currentWordIndex].map((el) => el.textContent);
};

async function validateGuess(guess) {
  const response = await apiService.makeRequest(
        `${SERVICE_URL}/game/validate-guess`,
        'POST', {
          guess,
          dictionaryOptions,
        },
  );

  if (response.error) {
    logService.error(response.error);
    return;
  }

  return response;
}

function addClassIfContains(arr, value, className) {
  if (arr.includes(value.textContent.toLowerCase())) {
    value.classList.add(className);
  }
}

function updateKeyboard() {
  const selectedLetters = [...getCurrentGuess()];

  for (const [, value] of Object.entries(keyboardLetters)) {
    // Start from a clean state - Note that we don't need to remove 'fail' class as it cannot change
    ['selected', 'success', 'warn'].forEach((className) => {
      value.classList.remove(className);
    });

    addClassIfContains(selectedLetters, value, 'selected');
    addClassIfContains(charGuesses.success, value, 'success');
    addClassIfContains(charGuesses.warn, value, 'warn');
    addClassIfContains(charGuesses.fail, value, 'fail');
  }
}

async function checkInput(inputValue) {
  // TODO: CTRL + Backspace deletes the whole word

  if (wordGuessed) return;

  inputValue = inputValue.toLowerCase();

  if (/^[a-z]{1,1}$/.test(inputValue)) {
    // Letter pressed
    if (currentCharIndex < dictionaryOptions.wordLength) {
      boardElements[currentWordIndex][currentCharIndex].textContent =
                inputValue;
      currentCharIndex++;
    } else {
      logService.warn('Word is already complete');
    }
  } else if (
    ['backspace', 'del'].includes(inputValue) &&
        currentCharIndex > 0
  ) {
    // Backspace pressed
    currentCharIndex--;
    boardElements[currentWordIndex][currentCharIndex].textContent = '';
  } else if (['enter', 'ok'].includes(inputValue)) {
    // Enter pressed
    if (currentCharIndex < 5) {
      logService.error('Word is not complete');
      return;
    }

    const guess = getCurrentGuess();
    const result = await validateGuess(guess);

    if (result) {
      result.result.forEach((result, index) => {
        if (result === 1) {
          boardElements[currentWordIndex][index].classList.add('success');
          charGuesses.success.push(guess[index]);

          if (charGuesses.warn.includes(guess[index])) {
            charGuesses.warn.splice(charGuesses.warn.indexOf(guess[index]), 1);
          }
        } else if (result === 0) {
          boardElements[currentWordIndex][index].classList.add('warn');
          if (!charGuesses.success.includes(guess[index])) {
            charGuesses.warn.push(guess[index]);
          }
        } else {
          boardElements[currentWordIndex][index].classList.add('fail');
          if (!charGuesses.success.includes(guess[index]) &&
                        !charGuesses.warn.includes(guess[index])
          ) {
            charGuesses.fail.push(guess[index]);
          }
        }
      });

      currentWordIndex++;
      currentCharIndex = 0;

      wordGuessed = result.result.every((result) => result === 1);
    }
  }

  updateKeyboard();
}

function buildBoard() {
  boardElements = [];

  // Create rows of words
  for (let i = 0; i < 6; i++) {
    boardElements.push([]);
    // Create characters for each word
    for (let j = 0; j < dictionaryOptions.wordLength; j++) {
      const charElement = document.createElement('div');
      boardElements[i].push(charElement);
      boardElement.appendChild(charElement);
    }
  }
}

function prepareElements() {
  // Assign DOM elements
  boardElement = document.querySelector('#board');
  rootElement = document.querySelector(':root');
  keyboardLetters = [
    ...document.querySelectorAll('#keyboard > .row > div'),
  ].reduce((acc, el) => {
    acc[el.textContent.toLowerCase()] = el;
    return acc;
  }, {});

  // Init game options
  rootElement.style.setProperty('--word-length', dictionaryOptions.wordLength);
}

function addEventListeners() {
  document.addEventListener('keydown', (e) => {
    checkInput(e.key);
  });

  document.querySelectorAll('#keyboard > .row > div').forEach((el) => {
    el.addEventListener('click', (e) => {
      checkInput(e.target.textContent);
    });
  });
}

function onInit() {
  prepareElements();
  addEventListeners();
  buildBoard();
}

// Only once the DOM tree has been built, load
window.addEventListener('DOMContentLoaded', onInit);
