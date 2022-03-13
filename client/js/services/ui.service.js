'use strict';
import { getCurrentGuess, guessedLetters } from './game.service.js';

let keyBoard = {};

function addClassIfContains(className, arr, value) {
  if (arr.includes(value.textContent.toLowerCase())) {
    value.classList.add(className);
  }
}

function initKeyboard() {
  keyBoard = [
    ...document.querySelectorAll('#keyboard > .row > div'),
  ].reduce((acc, el) => {
    acc[el.textContent.toLowerCase()] = el;
    return acc;
  }, {});
}

function updateKeyboard() {
  const selectedLetters = [...getCurrentGuess()].map((el) => el.toLowerCase());

  for (const letter of selectedLetters) {
    if (!keyBoard[letter]) continue;

    const key = keyBoard[letter];

    // Remove all classes to prevent the same class to be added multiple times
    ['selected', 'success', 'warn'].forEach((className) => {
      key.classList.remove(className);
    });

    addClassIfContains('success', guessedLetters.success, key);
    addClassIfContains('warn', guessedLetters.warn, key);
    addClassIfContains('fail', guessedLetters.fail, key);
  }
}

function selectKey(letter) {
  if (!keyBoard[letter]) return;
  keyBoard[letter].classList.add('selected');
}

function unselectKey(letter) {
  if (!keyBoard[letter]) return;
  keyBoard[letter].classList.remove('selected');
}

export {
  updateKeyboard,
  selectKey,
  unselectKey,
  initKeyboard,
};
