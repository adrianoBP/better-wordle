import { resetKeyboard, selectKey, unselectKey } from './keyboard.service.js';
import { validateGuess, isWordValid, getNewGameCode } from './api.service.js';
import { getItem, setItem, getDateFromMillisec, setUrlParams, deleteUrlParams } from '../utils.js';
import { settings, saveSettings } from './settings.service.js';

import '../components/game/game.component.js';

let gameElem = null;

// To user interaction when the game is loading
let isLoading = false;

// Dictionary of words and their validity to reduce API calls
const guesses = {};

let socket;

const startGame = async () => {
  isLoading = true;

  gameElem = document.createElement('game-component');

  // Append the new game at the top of the main element
  document.querySelector('main').prepend(gameElem);

  await loadGame();
  isLoading = false;
};

const checkInput = async (input, isCtrlPressed = false) => {
  // If we are playing multiplayer and the game didn't start, don't allow input
  if (settings.code != null && !gameElem.isMultiplayer) {
    return;
  }

  // Don't accept any inputs if the word is already guessed or the number of guesses has been reached
  if (!gameElem.boardElem.canInsert() || isLoading) return;

  // Give the user some haptic feedback

  if (settings.hapticFeedback && window.navigator) { window.navigator.vibrate(50); }

  input = input.toLowerCase();

  // LETTER
  if (/^[a-z]{1,1}$/.test(input)) {
    if (gameElem.boardElem.canAcceptLetter()) {
      gameElem.boardElem.addLetter(input);
      selectKey(input);

      // If option is enabled and we reached the end of the word, check if it is a valid word
      if (settings.validateOnComplete && gameElem.boardElem.wordLengthReached()) {
        await isGuessValid(gameElem);
      }
    }

    return;
  }

  // BACKSPACE
  if (input === 'backspace') {
    // if we press CTRL and backspace, we want to delete the whole word
    if (isCtrlPressed) {
      const currentGuess = gameElem.boardElem.guess;
      currentGuess.forEach((letter) => {
        unselectKey(letter);
        gameElem.boardElem.removeLetter(letter);
      });
    } else {
      const removedLetter = gameElem.boardElem.removeLetter();
      const currentGuess = gameElem.boardElem.guess;

      // Unselect only if it is the last occurrence in the guess
      if (!currentGuess.includes(removedLetter)) { unselectKey(removedLetter); }
    }
    return;
  }

  // ENTER
  if (input === 'enter' && gameElem.boardElem.wordLengthReached()) {
    isLoading = true;
    const guess = gameElem.boardElem.guess;

    try {
      if (!await isGuessValid(gameElem)) {
        // Wiggle the word so that the user is aware that the word is invalid
        gameElem.boardElem.shakeWord();
        console.error('Word is not valid');
        return;
      }

      const validationResponse = await validateGuess(guess);
      if (validationResponse.error) {
        console.error(validationResponse.error);
        return;
      }

      await gameElem.applyValidationResult(guess.join(''), validationResponse.result, true);

      // If we have an id, it means that we are playing a custom game, hence, we don't want to store the game
      if (!settings.id) { saveGame(); }
    } finally {
      isLoading = false;
    }
  }
};

const isGuessValid = async (game) => {
  const guess = game.boardElem.guess.join('');

  // Check the cached words before calling the API
  if (guesses[guess] == null) {
    guesses[guess] = await isWordValid(guess);
  }

  game.isGuessValid = guesses[guess];
  return game.isGuessValid;
};

const saveGame = (reset) => {
  if (!settings.id) { setItem('game-save', reset ? [] : gameElem.boardElem.details); }
};

const loadGame = async () => {
  const savedGame = getItem('game-save');

  if (settings.code) {
    newMultiplayerGame();
    return;
  }

  // If we have an id, don't load (custom game)
  if (settings.id != null) return;

  try {
    // If the game day changed, don't load
    if (getDateFromMillisec(settings.gameTime) !== getDateFromMillisec()) {
    // Save the game and specify that we want to reset ('true')
      saveGame(true);
      return;
    }

    // If there are no saved game, don't load
    if (!savedGame) return;

    isLoading = true;
    await gameElem.load(savedGame);
    isLoading = false;
  } finally {
    settings.gameTime = Date.now();
    saveSettings();
  }
};

const applySettings = async (newSettings) => {
  // Tile selection change
  gameElem.boardElem.tileSelection = newSettings.tileSelection;

  // If the game options change, reset the game with the new settings
  if (settings.wordLength !== newSettings.wordLength || settings.difficulty !== newSettings.difficulty) {
    settings.wordLength = newSettings.wordLength;
    settings.difficulty = newSettings.difficulty;

    settings.id = await getNewGameCode();
    newRandomGame();

    gameElem.boardElem.init();
  }
};

const newMultiplayerGame = (isAdmin) => {
  if (gameElem.isMultiplayer) { return; }

  // If the user is admin, we want to start a new game
  if (isAdmin) { settings.code = null; }

  // Initiate connection to the server
  socket = new WebSocket('ws://' + window.location.hostname + ':' + (window.location.port || 80) + '/');
  socket.onopen = () => {
    socket.send(JSON.stringify(
      {
        event: 'new-game',
        code: settings.code,
        difficulty: settings.difficulty,
        wordLength: settings.wordLength,
      }));
  };

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);

    settings.code = data.code;
    settings.id = data.id;
    settings.difficulty = data.difficulty;
    settings.wordLength = data.wordLength;

    // Update URL with game parameters
    setUrlParams({
      id: settings.id,
      code: settings.code,
    });

    // We want to remake the board with multiplayer game settings
    gameElem.boardElem.init();

    gameElem.newLobby(data.playerCount, isAdmin);
    resetKeyboard();
  };
};

// Game is reset when the user changes the game settings (i.e. word length, difficulty, etc.)
// or when the user starts a new game with a random word
const newRandomGame = async () => {
  settings.code = null;

  // Update URL in case user wants to share the game
  setUrlParams({ id: settings.id });
  deleteUrlParams(['code']);

  // Set the game length - for base version (5), don't save length param to keep URL short
  if (settings.wordLength === 5) {
    deleteUrlParams(['length']);
  } else { setUrlParams({ length: settings.wordLength }); }

  isLoading = true;
  await gameElem.restart();
  resetKeyboard();
  isLoading = false;
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
