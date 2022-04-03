import { sleep } from '../../services/common.service.js';
import { updateKeyboard } from '../../services/keyboard.service.js';
import Tile from './tile/Tile.js';

class Gameboard {
  constructor(dictionaryOptions) {
    this.dictionaryOptions = dictionaryOptions;

    const boardElement = document.querySelector('#board');
    boardElement.replaceChildren([]);

    this.wordIndex = 0;
    this.letterIndex = 0;
    this.words = [];
    this.wordGuessed = false;

    // Add board to the DOM

    // Create rows of words
    for (let i = 0; i < dictionaryOptions.allowedGuessesCount; i++) {
      this.words.push([]);
      // Create characters for each word
      for (let j = 0; j < dictionaryOptions.wordLength; j++) {
        const tile = new Tile();
        this.words[i].push(tile);
        boardElement.appendChild(tile.htmlElement);
      }
    }
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
    return this.wordIndex < this.dictionaryOptions.allowedGuessesCount && !this.wordGuessed;
  }

  canAcceptLetter() {
    return this.letterIndex < this.dictionaryOptions.wordLength;
  }

  wordLengthReached() {
    return this.letterIndex === this.dictionaryOptions.wordLength;
  }

  getCurrentGuess() {
    return this.words[this.wordIndex].map((tile) => tile.letter);
  }

  addLetter(letter) {
    this.words[this.wordIndex][this.letterIndex].letter = letter;
    this.letterIndex++;
  }

  addWord(word, validationResult) {
    word.forEach((letter) => {
      this.addLetter(letter);
    });

    if (validationResult) this.applyValidationResult(validationResult);

    this.wordIndex++;
    this.letterIndex = 0;
  }

  removeLetter() {
    if (this.letterIndex === 0) return;

    this.words[this.wordIndex].forEach(tile => {
      tile.removeClass('error');
    });

    this.letterIndex--;

    this.words[this.wordIndex][this.letterIndex].htmlElement.textContent = '';
  }

  markCurrentWordInvalid() {
    this.words[this.wordIndex].forEach(tile => {
      tile.addClass('error');
    });
  }

  async applyValidationResult(validationResult, incrementWordIndex) {
    // List of keyboard keys that need to be updated according to the validation result
    const keysToReload = [];
    const guess = this.getCurrentGuess();

    // We copy the index of the word as multiple validations could happen at the same time (i.e. game load)
    const wordToUpdateIndex = this.wordIndex;

    if (validationResult) {
      for (let i = 0; i < guess.length; i++) {
        const letter = validationResult[i];

        let classResult = '';

        if (letter === 1) classResult = 'success';
        else if (letter === 0) classResult = 'warn';
        else classResult = 'fail';

        keysToReload.push({ letter: guess[i], classResult });

        this.words[wordToUpdateIndex][i].flip(classResult);

        await sleep(350);
      }

      updateKeyboard(keysToReload);

      if (incrementWordIndex) {
        this.wordIndex++;
        this.letterIndex = 0;
      }
    }

    // If all the letters are in the correct position, the user won the game
    if (validationResult.every(letter => letter === 1)) {
      this.wordGuessed = true;
    }
  }

  wiggleWord() {
    this.words[this.wordIndex].forEach((tile) => {
      tile.shake();
    });
  }
}

export default Gameboard;
