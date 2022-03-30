'use strict';
import * as logService from './log.service.js';
import * as animationService from './animation.service.js';
import { updateKeyboard, selectKey, unselectKey, getClassResult, saveKeyboard, loadKeyboard, showModal } from './ui.service.js';
import { validateWord, validateGuess, getTodayWord } from './api.service.js';
import { allowLoading, sleep } from './common.service.js';
import { getSetting, setSetting } from './storage.service.js';

const gameBoard = [];
const dictionaryOptions = {
  lang: 'en_en',
  wordLength: 5,
  allowedGuessesCount: 6,
};

let currentWordIndex = 0;
let currentLetterIndex = 0;
let wordGuessed = false;

const initGameBoard = () => {
  const boardElement = document.querySelector('#board');
  boardElement.replaceChildren([]);

  // Create rows of words
  for (let i = 0; i < dictionaryOptions.allowedGuessesCount; i++) {
    gameBoard.push([]);
    // Create characters for each word
    for (let j = 0; j < dictionaryOptions.wordLength; j++) {
      const charElement = document.createElement('div');
      gameBoard[i].push(charElement);
      boardElement.appendChild(charElement);
    }
  }

  loadGame();
};

const getCurrentGuess = () => {
  return gameBoard[currentWordIndex].map((el) => el.textContent);
};

const checkInput = async (input) => {
  // TODO: CTRL + Backspace deletes the whole word

  // Don't accept any inputs if the word is already guessed or the number of guesses has been reached
  if (wordGuessed || currentWordIndex === dictionaryOptions.allowedGuessesCount) return;

  input = input.toLowerCase();

  // If the input is a letter
  if (/^[a-z]{1,1}$/.test(input)) {
    // Letter pressed
    if (currentLetterIndex < dictionaryOptions.wordLength) {
      gameBoard[currentWordIndex][currentLetterIndex].textContent =
                input;
      currentLetterIndex++;
      selectKey(input);
    } else {
      logService.warn('Word is already complete');
    }

    return;
  }

  // If the input is a backspace
  if (
    ['backspace'].includes(input) &&
        currentLetterIndex > 0
  ) {
    // Backspace pressed
    currentLetterIndex--;
    const currentLetterElement = gameBoard[currentWordIndex][currentLetterIndex];

    // Unselect only if it is the last occurrence
    const guess = getCurrentGuess();
    if (guess.filter((el) => el === currentLetterElement.textContent).length === 1) {
      unselectKey(currentLetterElement.textContent);
    }
    gameBoard[currentWordIndex][currentLetterIndex].textContent = '';

    return;
  }

  // If the input is enter
  if (['enter'].includes(input)) {
    // Enter pressed
    if (currentLetterIndex < 5) {
      logService.error('Word is not complete');
      return;
    }

    const guess = getCurrentGuess();

    const wordValidationResult = await validateWord(guess.join(''));

    if (!wordValidationResult.isValid) {
      // Wiggle the word so that the user is aware that the word is invalid
      gameBoard[currentWordIndex].forEach((el) => {
        animationService.shake(el);
      });
      logService.error('Word is not valid');
      return;
    }

    const validationResult = await validateGuess(guess);

    // List of keyboard keys that need to be updated according to the validation result
    const keysToReload = [];

    if (validationResult) {
      for (let i = 0; i < guess.length; i++) {
        const letter = validationResult[i];

        let classResult = '';

        if (letter === 1) classResult = 'success';
        else if (letter === 0) classResult = 'warn';
        else classResult = 'fail';

        keysToReload.push({ letter: guess[i], classResult });
        animationService.flip(gameBoard[currentWordIndex][i], classResult);
        await sleep(350);
      }

      updateKeyboard(keysToReload);

      currentWordIndex++;
      currentLetterIndex = 0;

      wordGuessed = validationResult.every((result) => result === 1);
    }

    saveGame();

    if (wordGuessed) {
      showModal('You win!');
    } else if (currentWordIndex === dictionaryOptions.allowedGuessesCount) {
      const todaysWord = (await getTodayWord()).word;
      showModal('You lose!', `Today's word is: ${todaysWord}`);
    }
  }
};

const saveGame = () => {
  const boardResults = [];
  gameBoard.forEach((row) => {
    const rowResults = [];
    row.forEach((el) => {
      if (el.textContent) {
        rowResults.push({
          letter: el.textContent,
          classResult: getClassResult(el),
        });
      }
    });

    if (rowResults.length > 0) boardResults.push(rowResults);
  });

  setSetting('game-board', boardResults);
  saveKeyboard();
  setSetting('save-game-time', new Date().toISOString());
};

const loadGame = async () => {
  if (!allowLoading()) return;

  // Load game board
  const boardResults = getSetting('game-board');
  if (!boardResults) return;

  boardResults.forEach((row, rowI) => {
    row.forEach((el, colI) => {
      if (gameBoard?.[rowI]?.[colI]) {
        gameBoard[rowI][colI].textContent = el.letter;
        if (el.classResult) {
          animationService.flipWithDelay(gameBoard[rowI][colI], el.classResult, colI * 350);
        }
      }
    });

    currentWordIndex++;
    wordGuessed = row.every((el) => el.classResult === 'success');
  });

  if (wordGuessed) { showModal('You win!'); }
  if (currentWordIndex === dictionaryOptions.allowedGuessesCount) {
    const todaysWord = (await getTodayWord()).word;
    showModal('You lose!', `Today's word is: ${todaysWord}`);
  }

  await sleep(350 * dictionaryOptions.wordLength);
  loadKeyboard();
};

export {
  gameBoard,
  dictionaryOptions,

  initGameBoard,
  checkInput,
  getCurrentGuess,
};
