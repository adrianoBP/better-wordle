'use strict';
import * as logService from './log.service.js';
import { resetKeyboard, selectKey, unselectKey } from './keyboard.service.js';
import { validateGuess, isWordValid } from './api.service.js';
import { getItem, setItem, getDayFromMillisec } from './common.service.js';
import { settings, saveSettings } from './settings.service.js';

import '../components/game/game.component.js';

let mainGame = null;
let isLoading = false;

const startGame = async () => {
  isLoading = true;

  mainGame = document.createElement('game-component');
  mainGame.setAttribute('is-guess-valid', true);

  // Append at the top of the main element
  document.querySelector('main').prepend(mainGame);

  await loadGame();
  isLoading = false;
};

// Game is reset when the user changes the game settings (i.e. word length, difficulty, etc.)
// or when the user starts a new game with a random word
const resetGame = async (code) => {
  if (code) {
    // Update URL in case user wants to share the game
    const url = new URL(location.href);
    url.searchParams.set('code', settings.code);
    // For base version, don't save length param to keep URL short
    if (settings.wordLength !== 5) { url.searchParams.set('length', settings.wordLength); }
    history.pushState(null, '', url);
  }

  isLoading = true;
  await mainGame.restart();
  resetKeyboard();
  isLoading = false;
};

const checkInput = async (input) => {
  // TODO: CTRL + Backspace deletes the whole word

  // Don't accept any inputs if the word is already guessed or the number of guesses has been reached
  if (!mainGame.boardElem.canInsert() || isLoading) return;

  input = input.toLowerCase();

  // LETTER
  if (/^[a-z]{1,1}$/.test(input)) {
    if (mainGame.boardElem.canAcceptLetter()) {
      mainGame.boardElem.addLetter(input);
      selectKey(input);

      // If we reached the end of the word, check if it is a valid word
      // If not enabled in the settings, don't validate
      if (settings.validateOnComplete && mainGame.boardElem.wordLengthReached()) {
        isLoading = true;
        await isGuessValid(mainGame);
        isLoading = false;
      }
    }

    return;
  }

  // BACKSPACE
  if (input === 'backspace') {
    const removedLetter = mainGame.boardElem.removeLetter();
    const currentGuess = mainGame.boardElem.guess;

    // Unselect only if it is the last occurrence in the guess
    if (!currentGuess.includes(removedLetter)) { unselectKey(removedLetter); }

    return;
  }

  // ENTER
  if (input === 'enter' && mainGame.boardElem.wordLengthReached()) {
    isLoading = true;
    const guess = mainGame.boardElem.guess;

    try {
      // If we don't validate on complete, validate on enter
      if (!settings.validateOnComplete) { await isGuessValid(mainGame); }

      if (!mainGame.isGuessValid) {
        // Wiggle the word so that the user is aware that the word is invalid
        mainGame.boardElem.wiggleWord();
        logService.error('Word is not valid');
        return;
      }

      const validationResponse = await validateGuess(guess);
      if (validationResponse.error) {
        logService.error(validationResponse.error);
        return;
      }

      await mainGame.applyValidationResult(guess.join(''), validationResponse.result, true);

      // If we have a code, it means that we are playing a custom game, hence, we don't want to store the game
      if (!settings.code) { saveGame(); }
    } finally {
      isLoading = false;
    }
  }
};

// Dictionary of words and their validity to reduce API calls
const guesses = {};

const isGuessValid = async (game) => {
  const guess = game.boardElem.guess.join('');

  // If we don't know if the word is valid yet, check it
  if (guesses[guess] == null) {
    guesses[guess] = await isWordValid(guess);
  }

  game.isGuessValid = guesses[guess];
};

const saveGame = () => {
  setItem('game-save', mainGame.boardElem.details);
};

const loadGame = async () => {
  const savedGame = getItem('game-save');

  // If there are no settings, don't load
  if (!savedGame) return;

  // If the game day changed, don't load
  if (getDayFromMillisec(settings.gameTime) !== getDayFromMillisec()) {
    clearGameSettings();
    return;
  }

  // If we have a code in the URL, don't load
  if (settings.code != null) return;

  isLoading = true;
  await mainGame.load(savedGame);
  isLoading = false;
};

const applySettings = () => {
  // Tile selection change
  mainGame.boardElem.tileSelection = settings.tileSelection;
};

const clearGameSettings = () => {
  saveGame();
  // Make sure to reset the settings
  settings.code = null;
  settings.gameTime = Date.now();
  saveSettings();
};

export {
  isLoading,

  startGame,
  resetGame,

  saveGame,
  applySettings,

  checkInput,
};
