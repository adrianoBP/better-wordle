'use strict';
import { getSetting, setSetting } from './storage.service.js';
import { allowLoading } from './common.service.js';

let keyBoard = {};
const modal = {
  main: null,
  header: null,
  body: null,
};

const initUI = () => {
  initKeyboard();
  loadKeyboard();

  initModal();
};

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
    keyboardResult.push({ letter, classResult: getClassResult(keyBoard[letter]) });
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

const getClassResult = (element) => {
  if (element.classList.contains('success')) return 'success';
  else if (element.classList.contains('warn')) return 'warn';
  else if (element.classList.contains('fail')) return 'fail';
  else return '';
};

const setTheme = (theme, element) => {
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
};

const initModal = () => {
  modal.main = document.querySelector('#modal');
  modal.header = document.querySelector('#modal-title');
  modal.body = document.querySelector('#modal-body');
};

const showModal = (title, content) => {
  modal.main.classList.remove('hidden');
  modal.header.textContent = title;
  modal.body.textContent = content;
};

const hideModal = () => {
  modal.main.classList.add('hidden');
};


export {
  initUI,
  updateKeyboard,
  selectKey,
  unselectKey,

  saveKeyboard,
  loadKeyboard,

  getClassResult,

  setTheme,
  showModal,
  hideModal,
};
