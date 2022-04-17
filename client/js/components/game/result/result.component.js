'use strict';

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

    connectedCallback() {
      this._resultElement = this.shadow.querySelector('#result-text');
      this._wordElement = this.shadow.querySelector('#result-word');

      this._wordElement.addEventListener('click', () => {
        window.open(`https://google.com/search?q=${this._wordElement.textContent}+meaning`);
      });
    }

    get show() {
      return this.getAttribute('show') === 'true';
    }

    set show(value) {
      this.setAttribute('show', value);
    }

    updateVisibility() {
      this.shadow.querySelector('#result-component').style.display = this.show ? 'block' : 'none';
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
        this._resultElement.textContent = newValue ? 'You won!' : 'You lost!';
      }
    }
  }

  customElements.define('result-details', ResultDetails);
};
