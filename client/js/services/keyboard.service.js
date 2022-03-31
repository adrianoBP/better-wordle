'use strict';
import { getSetting, setSetting } from './storage.service.js';
import { allowLoading } from './common.service.js';
import { getElementType } from './ui.service.js';

let keyBoard = {};

const initKeyboard = () => {
  // Create a dictionary with all the keys
  keyBoard = [
    ...document.querySelectorAll('#keyboard > .row > div'),
  ].reduce((acc, el) => {
    acc[el.textContent.toLowerCase()] = el;
    return acc;
  }, {});
};

const updateKeyboard = (letterResults) => {
  // TODO: check if this can be optimized

  letterResults.forEach(element => {
    const key = keyBoard[element.letter];

    key.classList.remove('selected');

    // Don't add the same class again
    if (key.classList.contains('success') && element.classResult === 'success') { return; }
    if (key.classList.contains('warn') && element.classResult === 'warn') { return; }
    if (key.classList.contains('fail') && element.classResult === 'fail') { return; }

    if (element.classResult === 'success') {
      key.classList.remove('fail');
      key.classList.remove('warn');
      key.classList.add('success');
      return;
    }

    if (element.classResult === 'warn' && !key.classList.contains('success')) {
      key.classList.remove('fail');
      key.classList.add('warn');
      return;
    }

    if (element.classResult === 'fail' && !key.classList.contains('warn') && !key.classList.contains('success')) {
      key.classList.add('fail');
    }
  });
};

const selectKey = (letter) => {
  if (!keyBoard[letter]) return;
  keyBoard[letter].classList.add('selected');
};

const unselectKey = (letter) => {
  if (!keyBoard[letter]) return;
  keyBoard[letter].classList.remove('selected');
};

const saveKeyboard = () => {
  const keyboardResult = [];
  Object.keys(keyBoard).forEach((letter) => {
    keyboardResult.push({ letter, classResult: getElementType(keyBoard[letter]) });
  });

  setSetting('keyboard', keyboardResult);
};

const loadKeyboard = () => {
  if (!allowLoading()) return;

  const keyboardResult = getSetting('keyboard');
  if (!keyboardResult) return;
  keyboardResult.forEach((el) => {
    if (el.classResult) { keyBoard[el.letter].classList.add(el.classResult); }
  });
};

export {
  initKeyboard,
  loadKeyboard,

  updateKeyboard,
  selectKey,
  unselectKey,

  saveKeyboard,
};
