'use strict';
import apiService from './services/api.service.js';
import logService from './services/log.service.js';

// Only once the DOM tree has been built, load
window.addEventListener('DOMContentLoaded', onInit);

const SERVICE_URL = 'http://localhost:8080/api';

let guessElement;
let resultElement;
let logElement;

const dictionaryOptions = {
  lang: 'en_en',
  wordLength: 5,
};

function onInit() {
  // Assign all variables as we are now sure that the DOM tree has been built
  guessElement = document.querySelector('#guess');
  resultElement = document.querySelector('#result');
  logElement = document.querySelector('#log');

  // Add all necessary event listeners
  document.addEventListener('keydown', keyDown);
}

async function keyDown(event) {
  const pressedKey = event.key.toLocaleLowerCase();
  if (/^[a-z]{1,1}$/.test(pressedKey)) {
    if (guessElement.textContent.length < 5) { guessElement.textContent += pressedKey; } else logElement.textContent = 'Limit reached!';
  } else if (pressedKey === 'backspace') {
    guessElement.textContent = guessElement.textContent.slice(0, -1);
    logElement.textContent = '';
  } else if (pressedKey === 'enter') {
    if (guessElement.textContent.length < 5) {
      logElement.textContent = 'Guess too short';
      return;
    }
    const result = await validateGuess();

    if (result) {
      resultElement.innerHTML += `${result.result
        .map((el) => {
          if (el === 1) return '🟩';
          if (el === 0) return '🟨';
          return '🟪';
        })
        .join(', ')}<br />`;
    }
  }

  async function validateGuess() {
    const guess = guessElement.textContent;

    const response = await apiService.makeRequest(`${SERVICE_URL}/game/validate-guess`, 'POST',
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
