'use strict';
import { settings } from '../../../services/settings.service.js';
import { updateKeyboard } from '../../../services/keyboard.service.js';
import { sleep } from '../../../services/common.service.js';
import '../board/tile/tile.component.js';

class BoardDetails extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>
        @import url('js/components/game/board/board.component.css');
      </style>
      <div></div>
      `;

    this.words = [];
    this._wordGuessed = false;
  }

  get wordGuessed() {
    return this._wordGuessed;
  }

  get wordIndex() {
    if (!this.hasAttribute('word-index')) { return 0; }
    return parseInt(this.getAttribute('word-index'));
  }

  set wordIndex(value) {
    this.setAttribute('word-index', value);
  }

  get letterIndex() {
    if (!this.hasAttribute('letter-index')) { return 0; }
    return parseInt(this.getAttribute('letter-index'));
  }

  set letterIndex(value) {
    this.setAttribute('letter-index', value);
  }

  get guess() {
    return this.words[this.wordIndex].map((tile) => tile.letter);
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

  get tileSelection() {
    // By default, show the tile selection
    if (!this.hasAttribute('tile-selection')) return true;
    return this.getAttribute('tile-selection') === 'enabled';
  }

  set tileSelection(isEnabled) {
    this.setAttribute('tile-selection', isEnabled ? 'enabled' : 'disabled');
  }

  canInsert() {
    return this.wordIndex < settings.allowedGuessesCount && !this._wordGuessed;
  }

  canAcceptLetter() {
    return this.letterIndex < settings.wordLength;
  }

  wordLengthReached() {
    return this.letterIndex === settings.wordLength;
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

  addLetter(letter) {
    this.words[this.wordIndex][this.letterIndex].isSelected = false;
    this.words[this.wordIndex][this.letterIndex].letter = letter;
    this.letterIndex++;
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

  async applyValidationResult(validationResult, incrementWordIndex) {
    // List of keyboard keys that need to be updated according to the validation result
    const keysToReload = [];
    const guess = this.guess;

    // We copy the index of the word as multiple validations could happen at the same time (i.e. game load)
    const wordToUpdateIndex = this.wordIndex;

    if (validationResult) {
      for (let i = 0; i < guess.length; i++) {
        let classResult = '';

        if (validationResult[i] === 1) classResult = 'success';
        else if (validationResult[i] === 0) classResult = 'warn';
        else classResult = 'fail';

        keysToReload.push({ letter: guess[i], classResult });

        this.words[wordToUpdateIndex][i].flip(classResult);

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
    }
  }

  toggleNextTile() {
    if (this.tileSelection && this.wordIndex < settings.allowedGuessesCount &&
      this.letterIndex < settings.wordLength) {
      this.words[this.wordIndex][this.letterIndex].toggleSelection();
    }
  }

  markCurrentWordInvalid() {
    this.words[this.wordIndex].forEach(tile => {
      tile.type = 'error';
    });
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

  show() {
    this.shadow.querySelector('div').style.display = 'grid';
  }

  hide() {
    this.shadow.querySelector('div').style.display = 'none';
  }

  wiggleWord() {
    this.words[this.wordIndex].forEach((tile) => {
      tile.shake();
    });
  }

  initBoard() {
    // Make sure that the correct word length is set
    document.querySelector(':root')
      .style.setProperty('--cells-per-row', settings.wordLength);

    this.words = [];
    this.shadow.querySelector('div').innerHTML = '';

    // Create rows of words
    for (let i = 0; i < settings.allowedGuessesCount; i++) {
      this.words.push([]);
      // Create characters for each word
      for (let j = 0; j < settings.wordLength; j++) {
        this.words[i].push(this.createTile());
      }
    }

    this.onTileSelectionChange(settings.tileSelection);
  }

  createTile() {
    const tile = document.createElement('board-tile');
    tile.setAttribute('letter', '');
    tile.setAttribute('type', '');
    this.shadow.querySelector('div').appendChild(tile);
    return tile;
  }

  onTileSelectionChange(isSelected) {
    if (this.wordIndex < settings.allowedGuessesCount &&
      this.letterIndex < settings.wordLength) {
      this.words[this.wordIndex][this.letterIndex].isSelected = isSelected == null ? this.tileSelection : isSelected;
    }
  }

  connectedCallback() {
    this.wordIndex = 0;
    this.letterIndex = 0;

    // Add board to the DOM
    this.initBoard();
  }

  static get observedAttributes() {
    return ['tile-selection'];
  }

  attributeChangedCallback(name) {
    if (name === 'tile-selection') { this.onTileSelectionChange(); }
  }
}

customElements.define('board-details', BoardDetails);
