'use strict';
import { settings } from '../../../services/settings.service.js';

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

    get show() {
      return this.getAttribute('show') === 'true';
    }

    set show(value) {
      this.setAttribute('show', value);
    }

    buildStats() {
      this._statsHeader.innerHTML = '';
      this._statsContent.innerHTML = '';

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
        this._statsHeader.appendChild(stat);
      }

      const elementTemplate = this.shadow.querySelector('#stat-element-template');
      const maxCount = settings.stats.results.reduce((max, stat) => Math.max(max, stat), 0);

      for (let i = 0; i < settings.stats.results.length; i++) {
        const value = settings.stats.results[i];

        const statRow = elementTemplate.content.cloneNode(true);
        const statLabel = statRow.querySelector('.element-label');
        const statValue = statRow.querySelector('.element-value');

        statLabel.textContent = `${i + 1}`;
        statValue.textContent = value;

        statValue.style.width = `${(value / maxCount) * 100}%`;

        this._statsContent.appendChild(statRow);
      }
    }

    connectedCallback() {
      this._resultElement = this.shadow.querySelector('#result-text');
      this._wordContainer = this.shadow.querySelector('#result-word');
      this._wordElement = this.shadow.querySelector('#result-word-text');
      this._statsHeader = this.shadow.querySelector('#stats-header');
      this._statsContent = this.shadow.querySelector('#stats-content');

      this._wordContainer.addEventListener('click', () => {
        window.open(`https://google.com/search?q=${this._wordElement.textContent}+meaning`);
      });
    }

    updateVisibility() {
      this.shadow.querySelector('section').style.display = this.show ? 'flex' : 'none';

      if (this.show) {
        this.buildStats();
      }
    }

    static get observedAttributes() {
      return ['show', 'word', 'win'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'show' &&
        oldValue != null &&
        oldValue !== newValue) { this.updateVisibility(); }
      if (name === 'word') {
        this._wordElement.textContent = newValue;
      }
      if (name === 'win') {
        this._resultElement.textContent = newValue === 'true' ? 'You won!' : 'You lost!';
      }
    }
  }

  customElements.define('result-details', ResultDetails);
};
