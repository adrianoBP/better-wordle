'use strict';
import { sleep } from '../../services/common.service.js';
import { dictionaryOptions } from '../../services/game.service.js';
import Gameboard from './board/Gameboard.js';
import Result from './result/Result.js';
import { getWord, validateWord } from '../../services/api.service.js';

class Game {
  constructor() {
    this._gameElement = document.querySelector('#game');

    this._board = new Gameboard(this._gameElement, dictionaryOptions);
    this._result = new Result(this._gameElement);

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
        guess = await getWord(dictionaryOptions);
      }

      // TODO: Check if can be done better - i.e. as soon as the animation is complete
      await sleep(350);
      this._board.hide();
      this._result.show(guess, this._board.wordGuessed);
    }
  }

  async load(savedGameSettings) {
    for (const row of savedGameSettings.gameboard) {
      // Convert the element type to a validation type (-1: not present, 0: wrong position, 1: correct position)
      row.forEach((letter) => {
        letter.value = letter.type === 'success' ? 1 : letter.type === 'warn' ? 0 : -1;
      });

      const validationResult = row.map((el) => el.value);

      this._board.addWord(row.map((el) => el.letter), validationResult);
    }

    // TODO: Check if can be done better - i.e. as soon as the animation is complete
    await sleep(450 * dictionaryOptions.wordLength);

    if (this._board.wordGuessed || !this._board.canInsert()) {
      this._board.hide();
      this._result.show(await getWord(dictionaryOptions), this._board.wordGuessed);
    }
  }

  async restart() {
    this._board.reset();
    this._result.hide();
    await sleep(500);
  }
}

export default Game;
