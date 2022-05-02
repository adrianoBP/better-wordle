'use strict';
import { resetKeyboard, selectKey, unselectKey } from './keyboard.service.js';
import { validateGuess, isWordValid, getNewGameCode } from './api.service.js';
import { getItem, setItem, getDayFromMillisec } from '../utils.js';
import { settings, saveSettings } from './settings.service.js';

import '../components/game/game.component.js';

let mainGame = null;
let isLoading = false; // Used to prevent multiple calls to the API
const guesses = {}; // Dictionary of words and their validity to reduce API calls

let socket;

const startGame = async () => {
  isLoading = true;

  mainGame = document.createElement('game-component');
  mainGame.setAttribute('is-guess-valid', true);

  // Append the new game at the top of the main element
  document.querySelector('main').prepend(mainGame);

  await loadGame();
  isLoading = false;
};

const newMultiplayerGame = (isAdmin) => {
  if (mainGame.isMultiplayer) { return; }

  // If the user is admin, we want to start a new game
  if (isAdmin) { settings.gameId = null; }

  // Initiate connection to the server
  socket = new WebSocket('ws://' + window.location.hostname + ':' + (window.location.port || 80) + '/');
  socket.onopen = () => {
    socket.send(JSON.stringify(
      {
        event: 'new-game',
        gameId: settings.gameId,
        difficulty: settings.difficulty,
        wordLength: settings.wordLength,
      }));
  };

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    settings.gameId = data.gameId;
    settings.code = data.code;
    settings.difficulty = data.difficulty;
    settings.wordLength = data.wordLength;

    // Update URL with game parameters
    const url = new URL(window.location.href);
    url.searchParams.set('gameId', settings.gameId.toString());
    url.searchParams.set('code', settings.code);
    history.pushState(null, '', url);

    // We want to remake the board with multiplayer game settings
    mainGame.boardElem.init();

    mainGame.newLobby(data.playerCount, isAdmin);
    resetKeyboard();
  };
};

// Game is reset when the user changes the game settings (i.e. word length, difficulty, etc.)
// or when the user starts a new game with a random word
const newRandomGame = async () => {
  // Update URL in case user wants to share the game
  const url = new URL(location.href);
  url.searchParams.set('code', settings.code);
  url.searchParams.delete('gameId');

  // Set the game length - for base version (5), don't save length param to keep URL short
  if (settings.wordLength === 5) {
    url.searchParams.delete('length');
  } else { url.searchParams.set('length', settings.wordLength); }

  history.pushState(null, '', url);

  isLoading = true;
  await mainGame.restart();
  resetKeyboard();
  isLoading = false;
};

const checkInput = async (input) => {
  // If we are playing multiplayer and the game didn't start, don't allow input
  if (settings.gameId != null && !mainGame.isMultiplayer) {
    return;
  }

  // TODO: CTRL + Backspace deletes the whole word

  // Don't accept any inputs if the word is already guessed or the number of guesses has been reached
  if (!mainGame.boardElem.canInsert() || isLoading) return;

  // Give the user some haptic feedback
  if (settings.hapticFeedback) { window.navigator.vibrate(50); }

  input = input.toLowerCase();

  // LETTER
  if (/^[a-z]{1,1}$/.test(input)) {
    if (mainGame.boardElem.canAcceptLetter()) {
      mainGame.boardElem.addLetter(input);
      selectKey(input);

      // If we reached the end of the word, check if it is a valid word
      // If not enabled in the settings, don't validate
      if (settings.validateOnComplete && mainGame.boardElem.wordLengthReached()) {
        await isGuessValid(mainGame);
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
        console.error('Word is not valid');
        return;
      }

      const validationResponse = await validateGuess(guess);
      if (validationResponse.error) {
        console.error(validationResponse.error);
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

const isGuessValid = async (game) => {
  const guess = game.boardElem.guess.join('');

  // If we don't know if the word is valid yet, check it
  if (guesses[guess] == null) {
    guesses[guess] = await isWordValid(guess);
  }

  game.isGuessValid = guesses[guess];
};

const saveGame = (reset) => {
  if (!settings.code) { setItem('game-save', reset ? [] : mainGame.boardElem.details); }
};

const loadGame = async () => {
  const savedGame = getItem('game-save');

  if (settings.gameId) {
    newMultiplayerGame();
    return;
  }

  // If we have a code, don't load (custom game)
  if (settings.code != null) return;


  // If there are no saved game, don't load
  if (!savedGame) return;

  // If the game day changed, don't load
  if (getDayFromMillisec(settings.gameTime) !== getDayFromMillisec()) {
    // Save the game and specify that we want to reset ('true')
    saveGame(true);
    // Reset the game time
    settings.gameTime = Date.now();
    saveSettings();
    return;
  }

  isLoading = true;
  await mainGame.load(savedGame);
  isLoading = false;

  settings.gameTime = Date.now();
  saveSettings();
};

const applySettings = async (newSettings) => {
  // Tile selection change
  mainGame.boardElem.tileSelection = newSettings.tileSelection;

  // If the game options change, reset the game with the new settings
  if (settings.wordLength !== newSettings.wordLength || settings.difficulty !== newSettings.difficulty) {
    settings.wordLength = newSettings.wordLength;
    settings.difficulty = newSettings.difficulty;

    settings.code = await getNewGameCode();

    newRandomGame(settings.code);
    mainGame.boardElem.init();
  }
};

export {
  isLoading,
  socket,

  startGame,
  newMultiplayerGame,
  newRandomGame,

  saveGame,
  applySettings,

  checkInput,
};
