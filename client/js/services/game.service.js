'use strict';
import * as logService from './log.service.js';
import { resetKeyboard, selectKey, unselectKey } from './keyboard.service.js';
import { validateGuess, isWordValid } from './api.service.js';
import { getItem, setItem, getDayFromMillisec } from './common.service.js';
import { settings, saveSettings } from './settings.service.js';
import Game from '../components/game/Game.js';

let mainGame = null;
let isLoading = false;

const startGame = async () => {
  isLoading = true;
  mainGame = new Game();
  await loadGame();
  isLoading = false;
};

// Game is reset when the user changes the game settings (i.e. word length, difficulty, etc.)
// or when the user starts a new game with a random word
const resetGame = async (hash) => {
  if (hash) {
    // Update URL in case user wants to share the game
    const url = new URL(location.href);
    url.searchParams.set('hash', settings.hash);
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
  if (!mainGame.board.canInsert() || isLoading) return;

  input = input.toLowerCase();

  // LETTER
  if (/^[a-z]{1,1}$/.test(input)) {
    if (mainGame.board.canAcceptLetter()) {
      mainGame.board.addLetter(input);
      selectKey(input);

      // If we reached the end of the word, check if it is a valid word
      // If not enabled in the settings, don't validate
      if (settings.validateOnComplete && mainGame.board.wordLengthReached()) {
        isLoading = true;
        await isGuessValid(mainGame);
        isLoading = false;
      }
    }

    return;
  }

  // BACKSPACE
  if (input === 'backspace') {
    const removedLetter = mainGame.board.removeLetter();
    const currentGuess = mainGame.board.guess;

    // Unselect only if it is the last occurrence in the guess
    if (!currentGuess.includes(removedLetter)) { unselectKey(removedLetter); }

    return;
  }

  // ENTER
  if (input === 'enter' && mainGame.board.wordLengthReached()) {
    isLoading = true;
    const guess = mainGame.board.guess;

    try {
      // If we don't validate on complete, validate on enter
      if (!settings.validateOnComplete) { await isGuessValid(mainGame); }

      if (!mainGame.isGuessValid) {
        // Wiggle the word so that the user is aware that the word is invalid
        mainGame.board.wiggleWord();
        logService.error('Word is not valid');
        return;
      }

      const validationResponse = await validateGuess(guess);
      if (validationResponse.error) {
        logService.error(validationResponse.error);
        return;
      }

      await mainGame.applyValidationResult(guess.join(''), validationResponse.result, true);

      // If we have a hash, it means that we are playing a custom game, hence, we don't want to store the game
      if (!settings.hash) { saveGame(); }
    } finally {
      isLoading = false;
    }
  }
};

// List of words that the user has already guessed and are wrong - Reduce round trips to the server
const wrongGuesses = [];

const isGuessValid = async (game) => {
  const guess = game._board.guess.join('');

  // If the word is already guessed, don't validate
  if (wrongGuesses.includes(game.board.guess.join(''))) {
    game._isGuessValid = false;
  } else {
    // By default make it false to prevent the user from submitting the guess (word validation takes time)
    game._isGuessValid = false;
    game._isGuessValid = await isWordValid(guess);
  }

  if (!game._isGuessValid) {
    game._board.markCurrentWordInvalid();
    wrongGuesses.push(guess);
  }
};

const saveGame = () => {
  setItem('game-save', mainGame.board.details);
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

  // If we have a hash in the URL, don't load
  if (settings.hash != null) return;

  isLoading = true;
  await mainGame.load(savedGame);
  isLoading = false;
};

const applySettings = () => {
  // Tile selection
  mainGame.board.tileSelection = settings.tileSelection;
};

const clearGameSettings = () => {
  saveGame();
  // Make sure to reset the settings
  settings.hash = null;
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
