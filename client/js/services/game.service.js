'use strict';
import * as logService from './log.service.js';
import { resetKeyboard, selectKey, unselectKey } from './keyboard.service.js';
import { validateGuess } from './api.service.js';
import { getDayFromMillisec } from './common.service.js';
import { getItem, setItem } from './storage.service.js';
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

const resetGame = async () => {
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
      if (mainGame.board.wordLengthReached()) {
        isLoading = true;
        await mainGame.validateGuess();
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

      await mainGame.applyValidationResult(guess.join(''), validationResponse.result.validation, true);

      // If we have a hash, it means that we are playing a custom game, hence, we don't want to store the game
      if (!settings.hash) { saveGame(); }
    } finally {
      isLoading = false;
    }
  }
};

const saveGame = () => {
  setItem('game-save', mainGame.board.details);
};

const loadGame = async () => {
  const savedGame = getItem('game-save');

  // If there are no settings, don't load
  if (!savedGame) return;

  // If the game day, don't load
  if (getDayFromMillisec(settings.gameTime) !== getDayFromMillisec()) {
    clearGameSettings();
    return;
  }

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
  loadGame,
  applySettings,

  checkInput,
};
