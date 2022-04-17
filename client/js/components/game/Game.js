'use strict';
import { sleep } from '../../services/common.service.js';
import { saveSettings, settings } from '../../services/settings.service.js';
import Gameboard from './board/Gameboard.js';
import { getWord, validateWord } from '../../services/api.service.js';
import './result/result.component.js';
class Game {
  constructor() {
    this._gameElement = document.querySelector('#game');

    this._board = new Gameboard(this._gameElement);

    this._result = document.createElement('result-details');
    this._result.setAttribute('show', false);
    this._gameElement.appendChild(this._result);

    this._isGuessValid = false;
  }

  get board() {
    return this._board;
  }

  get isGuessValid() {
    return this._isGuessValid;
  }

  async validateGuess() {
    // By default make it false to prevent the user from submitting the guess
    this._isGuessValid = false;
    const guess = this._board.getCurrentGuess();
    this._isGuessValid = await validateWord(guess.join(''));
    if (!this._isGuessValid) {
      this._board.markCurrentWordInvalid();
    }
  }

  async applyValidationResult(guess, validationResult, incrementWordIndex) {
    await this._board.applyValidationResult(validationResult, incrementWordIndex);

    if (this._board.wordGuessed || !this._board.canInsert()) {
      // If the user didn't guess the word correctly, get it from the server
      if (!validationResult.every(x => x === 1)) {
        guess = await getWord(settings);
      }

      // TODO: Check if can be done better - i.e. as soon as the animation is complete
      await sleep(350);

      settings.stats.played++;
      settings.stats.won += this._board.wordGuessed ? 1 : 0;
      settings.stats.results[this._board.wordIndex - 1] += this._board.wordGuessed ? 1 : 0;
      saveSettings();

      this.showResult(guess);
    }
  }


  async load(savedGame) {
    for (const row of savedGame) {
      // Convert the element type to a validation type (-1: not present, 0: wrong position, 1: correct position)
      row.forEach((letter) => {
        letter.value = letter.type === 'success' ? 1 : letter.type === 'warn' ? 0 : -1;
      });

      const validationResult = row.map((el) => el.value);
      this._board.addWord(row.map((el) => el.letter), validationResult);
    }

    // TODO: Check if can be done better - i.e. as soon as the animation is complete
    await sleep(450 * settings.wordLength);

    if (this._board.wordGuessed || !this._board.canInsert()) {
      this.showResult(await getWord(settings));
    }
  }

  async restart() {
    this._board.reset();
    this._result.setAttribute('show', false);
    // this._result.hide();
    await sleep(500);
  }

  showResult(guess) {
    this._board.hide();
    this._result.setAttribute('show', true);
    this._result.setAttribute('word', guess);
    this._result.setAttribute('win', this._board.wordGuessed);
  }
}

export default Game;
