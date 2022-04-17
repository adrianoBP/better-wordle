'use strict';
import { checkInput, dictionaryOptions, startGame, resetGame, saveGame, isLoading } from './services/game.service.js';
import { initUI, setTheme } from './services/ui.service.js';
import { getSetting } from './services/storage.service.js';

// ! #debug
import { getNewGameHash, getWord } from './services/api.service.js';

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
    if (isLoading) return;

    // Creates a new game - The game is not saved!
    dictionaryOptions.hash = await getNewGameHash();
    resetGame();
  });


  // * MENU
  const toggler = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  toggler.addEventListener('click', () => {
    toggler.classList.toggle('active');
    menu.classList.toggle('active');
  });

  // Close menu on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggler.classList.remove('active');
      menu.classList.remove('active');
    }
  });

  // Close menu on backdrop
  document.querySelector('main').addEventListener('click', () => {
    toggler.classList.remove('active');
    menu.classList.remove('active');
  });


  // ! #debug
  document.querySelector('#debug').addEventListener('click', async () => {
    console.log(await getWord(dictionaryOptions));
    // debugger;
  });
}

function onInit() {
  prepareElements();
  addEventListeners();
  setTheme(getSetting('selected-theme', false));
}

// Only once the DOM tree has been built, load
window.addEventListener('DOMContentLoaded', onInit);
