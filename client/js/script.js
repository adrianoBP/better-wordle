'use strict';
import { checkInput, dictionaryOptions, startGame, resetGame, saveGame } from './services/game.service.js';
import { initUI, setTheme } from './services/ui.service.js';
import { getSetting } from './services/storage.service.js';

// ! #debug
import { getNewGameHash } from './services/api.service.js';

let rootElement;

function prepareElements() {
  // Assign DOM elements
  rootElement = document.querySelector(':root');
  initUI();
  // Init game options
  rootElement.style.setProperty('--cells-per-row', dictionaryOptions.wordLength);

  startGame(true);
}

function addEventListeners() {
  document.addEventListener('keydown', (e) => { checkInput(e.key); });

  document.querySelector('#theme-switch').addEventListener('click', (event) => {
    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    setTheme(newTheme, event.target);
  });

  document.querySelector('#random-game').addEventListener('click', async () => {
    // Creates a new game - The game is not saved!
    dictionaryOptions.hash = await getNewGameHash();
    resetGame();
  });

  // TODO: Check if this should be added to ui.service.js
  document.querySelector('#modal-close').addEventListener('click', () => {
    const modal = document.querySelector('#modal');
    if (modal.classList.contains('hidden')) { modal.classList.remove('hidden'); } else { modal.classList.add('hidden'); }
  });

  // ! #debug
  document.querySelector('#debug').addEventListener('click', async () => {
    debugger;
  });
}

function onInit() {
  prepareElements();
  addEventListeners();
  setTheme(getSetting('selected-theme', false));
}

// Only once the DOM tree has been built, load
window.addEventListener('DOMContentLoaded', onInit);
