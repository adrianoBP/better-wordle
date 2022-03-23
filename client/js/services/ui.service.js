'use strict';
import { getSetting, setSetting } from './storage.service.js';

let keyBoard = {};

function initKeyboard() {
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
    key.classList.remove('selected');
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

export {
  initKeyboard,
  updateKeyboard,
  selectKey,
  unselectKey,

  saveKeyboard,
  loadKeyboard,

  getClassResult,
};
