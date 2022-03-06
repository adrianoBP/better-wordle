'use strict';
import apiService from './services/api.service.js';
import logService from './services/log.service.js';

const SERVICE_URL = 'http://localhost:8080/api';

let boardElement;
const boardElements = [];

const dictionaryOptions = {
  lang: 'en_en',
  wordLength: 5,
};

let currentWordIndex = 0;
let currentCharIndex = 0;
let wordGuessed = false;

async function keyDown(event) {
  // TODO: CTRL + Backspace deletes the whole word

  if (wordGuessed) return;

  const pressedKey = event.key.toLocaleLowerCase();

  if (/^[a-z]{1,1}$/.test(pressedKey)) {
    if (currentCharIndex < dictionaryOptions.wordLength) {
      boardElements[currentWordIndex][currentCharIndex].textContent =
        pressedKey;
      currentCharIndex++;
    } else {
      logService.error('Word is already complete');
    }
  } else if (pressedKey === 'backspace' && currentCharIndex > 0) {
    currentCharIndex--;
    boardElements[currentWordIndex][currentCharIndex].textContent = '';
  } else if (pressedKey === 'enter') {
    if (currentCharIndex < 5) {
      logService.error('Word is not complete');
      return;
    }
    const result = await validateGuess();

    if (result) {
      result.result.forEach((result, index) => {
        if (result === 1) { boardElements[currentWordIndex][index].classList.add('success'); } else if (result === 0) { boardElements[currentWordIndex][index].classList.add('warn'); }
      });

      currentWordIndex++;
      currentCharIndex = 0;

      wordGuessed = result.result.every(result => result === 1);
    }
  }

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
}

function prepareElements() {
  boardElement = document.querySelector('#board');

  for (let i = 0; i < 6; i++) {
    const rowElement = document.createElement('div');
    rowElement.classList.add('word');
    boardElements.push([]);

    for (let j = 0; j < dictionaryOptions.wordLength; j++) {
      const charElement = document.createElement('div');
      rowElement.appendChild(charElement);
      boardElements[i].push(charElement);
    }
    boardElement.appendChild(rowElement);
  }
}

function addEventListeners() {
  document.addEventListener('keydown', keyDown);
}

function onInit() {
  prepareElements();
  addEventListeners();
}

// Only once the DOM tree has been built, load
window.addEventListener('DOMContentLoaded', onInit);
