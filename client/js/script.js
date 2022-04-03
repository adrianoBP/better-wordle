'use strict';
import { checkInput, dictionaryOptions, startGame, saveGame } from './services/game.service.js';
import { initUI, setTheme } from './services/ui.service.js';
import { getSetting } from './services/storage.service.js';

let rootElement;

function prepareElements() {
  // Assign DOM elements
  rootElement = document.querySelector(':root');
  initUI();
  // Init game options
  rootElement.style.setProperty('--cells-per-row', dictionaryOptions.wordLength);

  startGame();
}

function addEventListeners() {
  document.addEventListener('keydown', (e) => { checkInput(e.key); });

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
    debugger;
    // showModal('debug');
  });
}

function onInit() {
  prepareElements();
  addEventListeners();
  setTheme(getSetting('selected-theme', false));
}

// Only once the DOM tree has been built, load
window.addEventListener('DOMContentLoaded', onInit);
