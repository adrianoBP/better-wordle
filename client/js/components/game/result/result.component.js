import { settings } from '../../../services/settings.service.js';
import { getItem, isMobile, showElement, hideElement, hideElements } from '../../../utils.js';
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

      this.isMultiplayer = false;
    }

    get wordElem() { return this.shadow.querySelector('#result-word-text'); }

    get statsElem() { return this.shadow.querySelector('#stats'); }
    get legendElem() { return this.shadow.querySelector('#legend'); }
    get chartElem() { return this.shadow.querySelector('#chart'); }

    get shareElem() { return this.shadow.querySelector('#share'); }

    get isShowing() { return this.getAttribute('is-showing') === 'true'; }
    set isShowing(value) { this.setAttribute('is-showing', value); }

    get word() { return this.getAttribute('word'); }
    set word(value) { this.setAttribute('word', value); }

    show(guess, gameWon, showStats, isMultiplayer) {
      this.isMultiplayer = isMultiplayer;

      this.shadow.querySelector('#result-text').textContent = gameWon ? 'You won!' : 'You lost!';
      this.word = guess;

      if (showStats) {
        // Show share element only when playing daily game
        if (navigator.clipboard && !isMobile() && !isMultiplayer) {
          showElement(this.shareElem);
        } else {
          hideElement(this.shareElem);
        }

        showElement(this.statsElem);
      } else {
        hideElements([this.statsElem, this.shareElem]);
      }

      hideKeyboard();
      this.isShowing = true;
    }

    hide() {
      this.isShowing = false;
      showKeyboard();
      hideElements([this.statsElem, this.shareElem]);
    }

    buildStats() {
      this.legendElem.replaceChildren([]);
      this.chartElem.replaceChildren([]);

      // Add legend
      const legendItemTemplate = this.shadow.querySelector('#legend-item-template');

      const stats = this.isMultiplayer ? settings.stats.multiplayer : settings.stats.daily;

      const statHeaders = [
        {
          label: 'Played' + (this.isMultiplayer ? ' (multiplayer)' : ''),
          value: stats.played,
        },
        {
          label: 'Win %',
          value: stats.played === 0 ? 0 : (stats.won * 100 / stats.played).toFixed(1),
        },
      ];

      for (const statHeader of statHeaders) {
        const legendItem = legendItemTemplate.content.cloneNode(true);
        legendItem.querySelector('.label').textContent = statHeader.label;
        legendItem.querySelector('.value').textContent = statHeader.value;
        this.legendElem.appendChild(legendItem);
      }

      const chartElemTemplate = this.shadow.querySelector('#chart-item-template');
      const maxCount = stats.results.reduce((max, stat) => Math.max(max, stat), 0);

      // Create stats bar chart
      for (let i = 0; i < stats.results.length; i++) {
        const value = stats.results[i];

        const statRow = chartElemTemplate.content.cloneNode(true);
        const statLabel = statRow.querySelector('.label');
        const statValue = statRow.querySelector('.value');

        statLabel.textContent = `${i + 1}`;
        statValue.textContent = value;

        statValue.style.width = `${(value / maxCount) * 100}%`;

        this.chartElem.appendChild(statRow);
      }
    }

    connectedCallback() {
      this.shadow.querySelector('#result-word')
        .addEventListener('click', () => {
          window.open(`https://google.com/search?q=${this.wordElem.textContent}+meaning`);
        });

      // Share button
      this.updateIcon(this.shareElem, shareSVG);
      this.shareElem.addEventListener('click', () => {
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

${emojiGame}`;

        // Navigator.clipboard is not available in mobile devices.
        // Document.execCommand is deprecated
        // Navigator.share only available through HTTPS (out of scope for this project)
        navigator.clipboard.writeText(copyText).then(() => {
          this.updateIcon(this.shareElem, tickSVG);
          setTimeout(() => {
            this.updateIcon(this.shareElem, shareSVG);
          }, 2000);
        });
      });
    }

    updateIcon(element, svgIcon) {
      element.replaceChildren([]);
      element.appendChild(svgIcon);
    }

    onVisibilityChange() {
      if (this.isShowing) {
        showElement(this.shadow.querySelector('main'));
      } else {
        hideElement(this.shadow.querySelector('main'));
      }

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
