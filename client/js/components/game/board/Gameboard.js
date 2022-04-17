'use strict';
import { sleep } from '../../../services/common.service.js';
import { updateKeyboard } from '../../../services/keyboard.service.js';
import { settings } from '../../../services/settings.service.js';
import Tile from './tile/Tile.js';

class Gameboard {
  constructor(gameElement) {
    this.boardElement = document.createElement('div');
    this.boardElement.id = 'board';
    gameElement.appendChild(this.boardElement);

    this.boardElement.replaceChildren([]);

    this.wordIndex = 0;
    this.letterIndex = 0;
    this.words = [];
    this._wordGuessed = false;

    // Add board to the DOM
    // Create rows of words
    for (let i = 0; i < settings.allowedGuessesCount; i++) {
      this.words.push([]);
      // Create characters for each word
      for (let j = 0; j < settings.wordLength; j++) {
        const tile = new Tile(this.boardElement);
        this.words[i].push(tile);
      }
    }
    this.toggleNextTile();
  }

  get wordGuessed() {
    return this._wordGuessed;
  }

  async reset() {
    this.show();

    this.words.forEach((tiles) => {
      tiles.forEach((tile) => {
        if (tile.letter) {
          tile.flip();
        } else {
          tile.type = '';
        }
      });
    });

    this.wordIndex = 0;
    this.letterIndex = 0;
    this._wordGuessed = false;

    // Wait for the flip to finish
    await sleep(350);

    this.toggleNextTile();
  }

  get details() {
    const details = [];

    this.words.forEach(tiles => {
      const wordResult = [];

      tiles.forEach(tile => {
        if (tile.letter) {
          wordResult.push({
            letter: tile.letter,
            type: tile.type,
          });
        }
      });

      if (wordResult.length > 0) details.push(wordResult);
    });

    return details;
  }

  // TODO: Check if this can be optimized

  canInsert() {
    return this.wordIndex < settings.allowedGuessesCount && !this._wordGuessed;
  }

  canAcceptLetter() {
    return this.letterIndex < settings.wordLength;
  }

  wordLengthReached() {
    return this.letterIndex === settings.wordLength;
  }

  getCurrentGuess() {
    return this.words[this.wordIndex].map((tile) => tile.letter);
  }

  addLetter(letter) {
    this.toggleNextTile();
    this.words[this.wordIndex][this.letterIndex].letter = letter;
    this.letterIndex++;

    this.toggleNextTile();
  }

  addWord(word, validationResult) {
    if (!this.canInsert()) return;

    word.forEach((letter) => {
      this.addLetter(letter);
    });

    if (validationResult) this.applyValidationResult(validationResult);
    this.wordIndex++;
    this.letterIndex = 0;

    this.toggleNextTile();
  }

  removeLetter() {
    if (this.letterIndex === 0) return;

    this.toggleNextTile();

    // If we delete a letter, we know for sure that the word is not a complete word, hence remove the error class
    this.words[this.wordIndex].forEach(tile => {
      tile.type = '';
    });

    this.letterIndex--;

    const letterToRemove = this.words[this.wordIndex][this.letterIndex].letter;
    this.words[this.wordIndex][this.letterIndex].letter = '';
    this.toggleNextTile();

    // Return the removed letter
    return letterToRemove;
  }

  markCurrentWordInvalid() {
    this.words[this.wordIndex].forEach(tile => {
      tile.type = 'error';
    });
  }

  show() {
    this.boardElement.style.display = 'grid';
  }

  hide() {
    this.boardElement.style.display = 'none';
  }

  async applyValidationResult(validationResult, incrementWordIndex) {
    // List of keyboard keys that need to be updated according to the validation result
    const keysToReload = [];
    const guess = this.getCurrentGuess();

    // We copy the index of the word as multiple validations could happen at the same time (i.e. game load)
    const wordToUpdateIndex = this.wordIndex;

    const tileFlips = [];

    if (validationResult) {
      for (let i = 0; i < guess.length; i++) {
        let classResult = '';

        if (validationResult[i] === 1) classResult = 'success';
        else if (validationResult[i] === 0) classResult = 'warn';
        else classResult = 'fail';

        keysToReload.push({ letter: guess[i], classResult });

        tileFlips.push(this.words[wordToUpdateIndex][i].flip(classResult));

        await sleep(350);
      }

      // Wait for the last flip animation to fully finish
      await sleep(200);
      updateKeyboard(keysToReload);

      if (incrementWordIndex) {
        this.wordIndex++;
        this.letterIndex = 0;

        this.toggleNextTile();
      }
    }

    // If all the letters are in the correct position, the user won the game
    if (validationResult.every(letter => letter === 1)) {
      this._wordGuessed = true;
      // this.hide();
    }

    if (this.wordIndex === settings.allowedGuessesCount) {
      // Add some time to allow the user to see the word before hiding it
      await sleep(300);
      // this.hide();
    }
  }

  wiggleWord() {
    this.words[this.wordIndex].forEach((tile) => {
      tile.shake();
    });
  }

  toggleNextTile() {
    // TODO: implement setting to disable this feature
    if (settings.tileSelection && this.wordIndex < settings.allowedGuessesCount &&
      this.letterIndex < settings.wordLength) {
      this.words[this.wordIndex][this.letterIndex].toggleSelection();
    }
  }

  forceTileSelection() {
    if (this.wordIndex < settings.allowedGuessesCount &&
      this.letterIndex < settings.wordLength) {
      this.words[this.wordIndex][this.letterIndex].forceTileSelection(settings.tileSelection);
    }
  }
}

export default Gameboard;
