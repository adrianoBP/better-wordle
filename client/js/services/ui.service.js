'use strict';
import { setSetting } from './storage.service.js';
import { initKeyboard } from './keyboard.service.js';
import { initBoard } from './board.service.js';

const modal = {
  main: null,
  header: null,
  body: null,
};

const initUI = () => {
  initBoard();

  initKeyboard();

  initModal();
};

const getElementType = (element) => {
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

  getElementType,

  setTheme,
  showModal,
  hideModal,
};
