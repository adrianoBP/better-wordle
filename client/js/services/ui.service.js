'use strict';
import { getSetting, setSetting } from './storage.service.js';

let keyBoard = {};

function initKeyboard() {
  // Create a dictionary with all the keys
  keyBoard = [
    ...document.querySelectorAll('#keyboard > .row > div'),
  ].reduce((acc, el) => {
    acc[el.textContent.toLowerCase()] = el;
    return acc;
  }, {});
}

function updateKeyboard(letterResults) {
  letterResults.forEach(element => {
    const key = keyBoard[element.letter];

    // Clear all classes from the key
    ['selected', 'success', 'warn', 'fail'].forEach(className => {
      key.classList.remove(className);
    });

    key.classList.add(element.classResult);
  });
}

function selectKey(letter) {
  if (!keyBoard[letter]) return;
  keyBoard[letter].classList.add('selected');
}

function unselectKey(letter) {
  if (!keyBoard[letter]) return;
  keyBoard[letter].classList.remove('selected');
}

function saveKeyboard() {
  const keyboardResult = [];
  Object.keys(keyBoard).forEach((letter) => {
    keyboardResult.push({ letter, classResult: getClassResult(keyBoard[letter]) });
  });

  setSetting('keyboard', keyboardResult);
}

function loadKeyboard() {
  const keyboardResult = getSetting('keyboard');
  if (!keyboardResult) return;
  keyboardResult.forEach((el) => {
    if (el.classResult) { keyBoard[el.letter].classList.add(el.classResult); }
  });
}

function getClassResult(element) {
  if (element.classList.contains('success')) return 'success';
  else if (element.classList.contains('warn')) return 'warn';
  else if (element.classList.contains('fail')) return 'fail';
  else return '';
}

function setTheme(theme, element) {
  if (theme == null) { theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }

  document.body.classList.remove('dark');
  document.body.classList.remove('light');
  document.body.classList.add(theme);

  if (element == null) { element = document.querySelector('#theme-switch'); }

  if (theme === 'dark') {
    element.src = '../../resources/icons/sun.svg';
  } else if (theme === 'light') {
    element.src = '../../resources/icons/half-moon.svg';
  }

  setSetting('selected-theme', theme);
}

export {
  initKeyboard,
  updateKeyboard,
  selectKey,
  unselectKey,

  saveKeyboard,
  loadKeyboard,

  getClassResult,

  setTheme,
};
