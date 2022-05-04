'use strict';
import { settings } from '../../../services/settings.service.js';
import { getItem, isMobile } from '../../../utils.js';
import { shareSVG, tickSVG } from '../../../svg/index.js';
import { hideKeyboard, showKeyboard } from '../../../services/keyboard.service.js';

fetch('js/components/game/result/result.component.html')
  .then(stream => stream.text())
  .then(text => define(text));

const define = (template) => {
  class ResultDetails extends HTMLElement {
    constructor() {
      super();

      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = template;
    }

    get wordElem() { return this.shadow.querySelector('#result-word-text'); }

    get statsHeaderElem() { return this.shadow.querySelector('#stats-header'); }

    get statsContentElem() { return this.shadow.querySelector('#stats-content'); }

    get isShowing() { return this.getAttribute('is-showing') === 'true'; }
    set isShowing(value) { this.setAttribute('is-showing', value); }

    get word() { return this.getAttribute('word'); }
    set word(value) { this.setAttribute('word', value); }

    show(guess, gameWon, showStats) {
      this.shadow.querySelector('#result-text').textContent = gameWon ? 'You won!' : 'You lost!';
      this.word = guess;

      this.shadow.querySelector('#stats').style.display = showStats ? 'block' : 'none';
      this.shadow.querySelector('#share').style.display = (showStats && !isMobile()) ? 'flex' : 'none';

      hideKeyboard();
      this.isShowing = true;
    }

    hide() {
      this.isShowing = false;
      showKeyboard();
    }

    buildStats() {
      this.statsHeaderElem.replaceChildren([]);
      this.statsContentElem.replaceChildren([]);

      // Add totals
      const totalTemplate = this.shadow.querySelector('#stat-total-template');
      const statHeaders = [
        {
          label: 'Played',
          value: settings.stats.played,
        },
        {
          label: 'Win %',
          value: (settings.stats.won * 100 / settings.stats.played).toFixed(1),
        },
      ];

      for (const statHeader of statHeaders) {
        const stat = totalTemplate.content.cloneNode(true);
        stat.querySelector('.total-label').textContent = statHeader.label;
        stat.querySelector('.total-value').textContent = statHeader.value;
        this.statsHeaderElem.appendChild(stat);
      }

      const elementTemplate = this.shadow.querySelector('#stat-element-template');
      const maxCount = settings.stats.results.reduce((max, stat) => Math.max(max, stat), 0);

      // Create stats bar chart
      for (let i = 0; i < settings.stats.results.length; i++) {
        const value = settings.stats.results[i];

        const statRow = elementTemplate.content.cloneNode(true);
        const statLabel = statRow.querySelector('.element-label');
        const statValue = statRow.querySelector('.element-value');

        statLabel.textContent = `${i + 1}`;
        statValue.textContent = value;

        statValue.style.width = `${(value / maxCount) * 100}%`;

        this.statsContentElem.appendChild(statRow);
      }
    }

    connectedCallback() {
      this.shadow.querySelector('#result-word')
        .addEventListener('click', () => {
          window.open(`https://google.com/search?q=${this.wordElem.textContent}+meaning`);
        });

      // Share button
      const shareButton = this.shadow.querySelector('#share');
      this.updateIcon(shareButton, shareSVG);

      shareButton.addEventListener('click', () => {
        const savedGame = getItem('game-save');

        const emojiGame = savedGame.map(word => {
          return word.map((letter) => {
            return letter.type === 'success' ? '🟩' : letter.type === 'warn' ? '🟨' : '🟪';
          }).join('');
        }).join('\n');

        const date = new Date(settings.gameTime);
        const copyText = `
better-wordle

date: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}
attempts: ${savedGame.length}/${settings.allowedGuessesCount}

${emojiGame}`;

        // Navigator.clipboard is not available in mobile devices.
        // Document.execCommand is deprecated
        // Navigator.share only available through HTTPS (out of scope for this project)
        navigator.clipboard.writeText(copyText).then(() => {
          this.updateIcon(shareButton, tickSVG);
          setTimeout(() => {
            this.updateIcon(shareButton, shareSVG);
          }, 2000);
        });
      });
    }

    updateIcon(element, svgIcon) {
      element.replaceChildren([]);
      element.appendChild(svgIcon);
    }

    onVisibilityChange() {
      this.shadow.querySelector('section').style.display = this.isShowing ? 'flex' : 'none';

      if (this.isShowing) {
        this.buildStats();
      }
    }

    static get observedAttributes() {
      return ['is-showing', 'word', 'win'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'is-showing' &&
        oldValue != null &&
        oldValue !== newValue) { this.onVisibilityChange(); }
      if (name === 'word') {
        this.wordElem.textContent = newValue;
      }
    }
  }

  customElements.define('result-details', ResultDetails);
};
