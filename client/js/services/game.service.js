import { resetKeyboard, selectKey, unselectKey } from './keyboard.service.js';
import { validateGuess, isWordValid, getNewGameCode } from './api.service.js';
import { getItem, setItem, getDayFromMillisec, setUrlParams, deleteUrlParams } from '../utils.js';
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
    mainGame.boardElem.init();

    mainGame.newLobby(data.playerCount, isAdmin);
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
  await mainGame.restart();
  resetKeyboard();
  isLoading = false;
};

const checkInput = async (input) => {
  // If we are playing multiplayer and the game didn't start, don't allow input
  if (settings.code != null && !mainGame.isMultiplayer) {
    return;
  }

  // TODO: CTRL + Backspace deletes the whole word

  // Don't accept any inputs if the word is already guessed or the number of guesses has been reached
  if (!mainGame.boardElem.canInsert() || isLoading) return;

  // Give the user some haptic feedback

  if (settings.hapticFeedback && window.navigator) { window.navigator.vibrate(50); }

  input = input.toLowerCase();

  // LETTER
  if (/^[a-z]{1,1}$/.test(input)) {
    if (mainGame.boardElem.canAcceptLetter()) {
      mainGame.boardElem.addLetter(input);
      selectKey(input);

      // If option is enabled and we reached the end of the word, check if it is a valid word
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
      if (!await isGuessValid(mainGame)) {
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
  if (!settings.id) { setItem('game-save', reset ? [] : mainGame.boardElem.details); }
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
    if (getDayFromMillisec(settings.gameTime) !== getDayFromMillisec()) {
    // Save the game and specify that we want to reset ('true')
      saveGame(true);
      return;
    }

    // If there are no saved game, don't load
    if (!savedGame) return;

    isLoading = true;
    await mainGame.load(savedGame);
    isLoading = false;
  } finally {
    settings.gameTime = Date.now();
    saveSettings();
  }
};

const applySettings = async (newSettings) => {
  // Tile selection change
  mainGame.boardElem.tileSelection = newSettings.tileSelection;

  // If the game options change, reset the game with the new settings
  if (settings.wordLength !== newSettings.wordLength || settings.difficulty !== newSettings.difficulty) {
    settings.wordLength = newSettings.wordLength;
    settings.difficulty = newSettings.difficulty;

    settings.id = await getNewGameCode();
    newRandomGame();

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
