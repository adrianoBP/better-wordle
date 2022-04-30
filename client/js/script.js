'use strict';
import { checkInput, startGame } from './services/game.service.js';
import { loadSettings, settings } from './services/settings.service.js';
import './components/navbar/navbar.component.js';
import './components/keyboard/keyboard.component.js';

let rootElement;

function prepareElements() {
  // Assign DOM elements
  rootElement = document.querySelector(':root');
  // Init game properties
  rootElement.style.setProperty('--cells-per-row', settings.wordLength);
}

function addEventListeners() {
  // Global input check
  document.addEventListener('keydown', (e) => { checkInput(e.key); });

  // Close menu on backdrop click
  document.querySelector('main').addEventListener('click', () => {
    document.querySelector('navbar-component').hideMenu();
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
