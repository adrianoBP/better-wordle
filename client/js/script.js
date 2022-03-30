'use strict';
import { initGameBoard, checkInput, dictionaryOptions } from './services/game.service.js';
import { initUI, setTheme, showModal } from './services/ui.service.js';
import { getSetting } from './services/storage.service.js';

let rootElement;

function prepareElements() {
  // Assign DOM elements
  rootElement = document.querySelector(':root');
  initUI();
  initGameBoard();

  // Init game options
  rootElement.style.setProperty('--cells-per-row', dictionaryOptions.wordLength);
}

function addEventListeners() {
  document.addEventListener('keydown', (e) => { checkInput(e.key); });

  document.querySelectorAll('#keyboard > .row > div').forEach((el) => {
    el.addEventListener('click', (e) => checkInput(e.currentTarget.dataset.keyref));
  });

  document.querySelector('#theme-switch').addEventListener('click', (event) => {
    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    setTheme(newTheme, event.target);
  });

  // TODO: Check if this should be added to ui.service.js
  document.querySelector('#modal-close').addEventListener('click', () => {
    const modal = document.querySelector('#modal');
    if (modal.classList.contains('hidden')) { modal.classList.remove('hidden'); } else { modal.classList.add('hidden'); }
  });


  // ! #debug
  document.querySelector('#debug').addEventListener('click', () => {
    showModal('debug');
  });
}

function onInit() {
  prepareElements();
  addEventListeners();
  setTheme(getSetting('selected-theme', false));
}

// Only once the DOM tree has been built, load
window.addEventListener('DOMContentLoaded', onInit);
