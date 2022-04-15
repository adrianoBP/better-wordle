'use strict';
import { sleep } from '../../services/common.service.js';
import { dictionaryOptions } from '../../services/game.service.js';
import Gameboard from './board/Gameboard.js';
import Result from './result/Result.js';
import { getWord } from '../../services/api.service.js';

class Game {
  constructor() {
    this._gameElement = document.querySelector('#game');

    this._board = new Gameboard(this._gameElement, dictionaryOptions);
    this._result = new Result(this._gameElement);
  }

  get board() {
    return this._board;
  }

  async applyValidationResult(guess, validationResult, incrementWordIndex) {
    await this._board.applyValidationResult(validationResult, incrementWordIndex);

    if (this._board.wordGuessed || !this._board.canInsert()) {
      if (this._board.wordGuessed || !this._board.canInsert()) {
        // TODO: Check if can be done better - i.e. as soon as the animation is complete
        await sleep(350);
        this._board.hide();
        this._result.show(guess, this._board.wordGuessed);
      }
    }
  }

  async load(savedGameSettings) {
    for (const row of savedGameSettings.gameboard) {
      // Convert the element type to a validation type (-1, 0, 1)
      row.forEach((letter) => {
        letter.value = letter.type === 'success' ? 1 : letter.type === 'warn' ? 0 : -1;
      });

      const validationResult = row.map((el) => el.value);

      this._board.addWord(row.map((el) => el.letter), validationResult);
    }

    // TODO: Check if can be done better - i.e. as soon as the animation is complete
    await sleep(500 * dictionaryOptions.wordLength);

    if (this._board.wordGuessed || !this._board.canInsert()) {
      this._board.hide();
      this._result.show(await getWord(dictionaryOptions), this._board.wordGuessed);
    }
  }

  restart() {
    this._board.reset();
    this._result.hide();
  }
}

export default Game;
