'use strict';
import { settings, saveSettings } from '../../services/settings.service.js';
import { getWord } from '../../services/api.service.js';
import { sleep } from '../../services/common.service.js';
import './board/board.component.js';
import './result/result.component.js';

class BoardDetails extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <div>
        <board-details></board-details>
        <result-details is-showing="false"></result-details>
      </div>
      `;
  }

  get boardElem() {
    return this.shadow.querySelector('board-details');
  }

  get resultElem() {
    return this.shadow.querySelector('result-details');
  }

  get isGuessValid() {
    return this.getAttribute('is-guess-valid') === 'true';
  }

  set isGuessValid(value) {
    this.setAttribute('is-guess-valid', value ? 'true' : 'false');
  }

  async applyValidationResult(guess, validationResult, incrementWordIndex) {
    await this.boardElem.applyValidationResult(validationResult, incrementWordIndex);

    if (this.boardElem.wordGuessed || !this.boardElem.canInsert()) {
      // If the user didn't guess the word correctly, get it from the server
      if (!validationResult.every(x => x === 1)) {
        guess = await getWord(settings);
      }

      // TODO: Check if can be done better - i.e. as soon as the animation is complete
      await sleep(350);

      settings.stats.played++;
      settings.stats.won += this.boardElem.wordGuessed ? 1 : 0;
      settings.stats.results[this.boardElem.wordIndex - 1] += this.boardElem.wordGuessed ? 1 : 0;
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
      this.boardElem.addWord(row.map((el) => el.letter), validationResult);
    }

    // TODO: Check if can be done better - i.e. as soon as the animation is complete
    await sleep(450 * settings.wordLength);

    if (this.boardElem.wordGuessed || !this.boardElem.canInsert()) {
      this.showResult(await getWord(settings));
    }
  }

  async restart() {
    this.boardElem.reset();
    this.resultElem.hide();
    await sleep(500);
  }

  showResult(guess) {
    this.boardElem.hide();
    this.resultElem.show(guess, this.boardElem.wordGuessed);
  }

  onIsGuessValidChange() {
    if (!this.isGuessValid) {
      this.boardElem.markCurrentWordInvalid();
    }
  }

  static get observedAttributes() {
    return ['is-guess-valid'];
  }

  attributeChangedCallback(name) {
    if (name === 'is-guess-valid') { this.onIsGuessValidChange(); }
  }
}

customElements.define('game-component', BoardDetails);
