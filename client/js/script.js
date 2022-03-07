'use strict';
import apiService from './services/api.service.js';
import logService from './services/log.service.js';

const SERVICE_URL = 'http://localhost:8080/api';

let rootElement;
let boardElement;
let boardElements = [];

const dictionaryOptions = {
  lang: 'en_en',
  wordLength: 8,
};

let currentWordIndex = 0;
let currentCharIndex = 0;
let wordGuessed = false;

async function validateGuess() {
  const guess = boardElements[currentWordIndex].map((el) => el.textContent);

  const response = await apiService.makeRequest(
    `${SERVICE_URL}/game/validate-guess`,
    'POST',
    {
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

async function keyDown(event) {
  // TODO: CTRL + Backspace deletes the whole word

  if (wordGuessed) return;

  const pressedKey = event.key.toLocaleLowerCase();

  if (/^[a-z]{1,1}$/.test(pressedKey)) {
    // Letter pressed
    if (currentCharIndex < dictionaryOptions.wordLength) {
      boardElements[currentWordIndex][currentCharIndex].textContent =
        pressedKey;
      currentCharIndex++;
    } else {
      logService.error('Word is already complete');
    }
  } else if (pressedKey === 'backspace' && currentCharIndex > 0) {
    // Backspace pressed
    currentCharIndex--;
    boardElements[currentWordIndex][currentCharIndex].textContent = '';
  } else if (pressedKey === 'enter') {
    // Enter pressed
    if (currentCharIndex < 5) {
      logService.error('Word is not complete');
      return;
    }
    const result = await validateGuess();

    if (result) {
      result.result.forEach((result, index) => {
        if (result === 1) {
          boardElements[currentWordIndex][index].classList.add('success');
        } else if (result === 0) {
          boardElements[currentWordIndex][index].classList.add('warn');
        } else {
          boardElements[currentWordIndex][index].classList.add('fail');
        }
      });

      currentWordIndex++;
      currentCharIndex = 0;

      wordGuessed = result.result.every((result) => result === 1);
    }
  }
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

  // Init game options
  rootElement.style.setProperty('--word-length', dictionaryOptions.wordLength);
}

function addEventListeners() {
  document.addEventListener('keydown', keyDown);
}

function onInit() {
  prepareElements();
  addEventListeners();
  buildBoard();
}

// Only once the DOM tree has been built, load
window.addEventListener('DOMContentLoaded', onInit);
