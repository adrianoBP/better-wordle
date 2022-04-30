'use strict';
import { checkInput, startGame, resetGame, isLoading } from './services/game.service.js';
import { loadSettings, settings } from './services/settings.service.js';
import './components/menu/menu.component.js';
import './components/keyboard/keyboard.component.js';

// ! #debug
import { getNewGameCode, getWord } from './services/api.service.js';

let rootElement;
let menu;

function prepareElements() {
  // Assign DOM elements
  rootElement = document.querySelector(':root');
  // Init game properties
  rootElement.style.setProperty('--cells-per-row', settings.wordLength);
  menu = document.querySelector('sliding-menu');
  menu.setAttribute('active', false);
  menu.setAttribute('settings', JSON.stringify(settings));
}

function addEventListeners() {
  document.addEventListener('keydown', (e) => { checkInput(e.key); });

  document.querySelector('#random-game').addEventListener('click', async () => {
    if (isLoading) return;
    // Creates a new game - The game is not saved!
    settings.code = await getNewGameCode();

    resetGame(settings.code);
  });

  // Close menu on backdrop click
  document.querySelector('main').addEventListener('click', () => {
    menu.setAttribute('active', false);
  });

  // ! #debug
  document.querySelector('#debug').addEventListener('click', async () => {
    console.log(await getWord(settings));
  });
}

function onInit() {
  loadSettings();

  prepareElements();
  addEventListeners();

  startGame();
}

// Only once the DOM tree has been built, load
window.addEventListener('DOMContentLoaded', onInit);
