'use strict';
import { initGameBoard, checkInput, dictionaryOptions } from './services/game.service.js';
import { initKeyboard } from './services/ui.service.js';

let rootElement;

function prepareElements() {
  // Assign DOM elements
  rootElement = document.querySelector(':root');
  initKeyboard();
  initGameBoard();

  // Init game options
  rootElement.style.setProperty('--cells-per-row', dictionaryOptions.wordLength);
}

function addEventListeners() {
  document.addEventListener('keydown', (e) => { checkInput(e.key); });

  document.querySelectorAll('#keyboard > .row > div').forEach((el) => {
    el.addEventListener('click', (e) => { checkInput(e.target.textContent); });
  });
}

function onInit() {
  prepareElements();
  addEventListeners();
}

// Only once the DOM tree has been built, load
window.addEventListener('DOMContentLoaded', onInit);
