'use strict';
import { backspaceSVG, enterSVG } from '../../../svg/index.js';
import { checkInput } from '../../../services/game.service.js';

class Key extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>
        @import url('js/components/keyboard/key/key.component.css');
      </style>
      <button></button>
      `;
  }

  get keyElem() { return this.shadow.querySelector('button'); }

  get letter() { return this.getAttribute('letter'); }
  set letter(letter) { this.setAttribute('letter', letter); }

  get type() { return this.getAttribute('type'); }
  set type(type) { this.setAttribute('type', type); }

  onTypeChange(oldType, newType) {
    this.unselect();

    if (newType === 'success') {
      // Remove warn in case the letter was already guessed but in the wrong position
      this.keyElem.classList.remove('warn');
      this.keyElem.classList.add('success');
      return;
    }

    if (newType === 'warn' && oldType !== 'success') {
      this.keyElem.classList.add('warn');
      return;
    }

    if (newType === 'fail' && oldType !== 'success' && oldType !== 'warn') {
      this.keyElem.classList.add('fail');
    }
  }

  onLetterInit(letter) {
    this.keyElem.dataset.keyref = letter;

    switch (letter) {
      case 'backspace':
        this.keyElem.appendChild(backspaceSVG);
        this.keyElem.setAttribute('aria-label', 'Backspace');
        this.keyElem.setAttribute('title', 'Backspace');
        this.keyElem.classList.add('icon');
        break;
      case 'enter':
        this.keyElem.appendChild(enterSVG);
        this.keyElem.setAttribute('aria-label', 'Enter');
        this.keyElem.setAttribute('title', 'Enter');
        this.keyElem.classList.add('icon');
        break;
      default:
        this.keyElem.textContent = letter.toUpperCase();
    }
  }

  select() {
    if (!this.keyElem.classList.contains('selected')) {
      this.keyElem.classList.add('selected');
    }
  }

  unselect() {
    this.keyElem.classList.remove('selected');
  }

  reset() {
    // Don't remove all classes because we may have additional classes (i.e. 'icon')
    this.keyElem.classList.remove('selected', 'success', 'warn', 'fail');
    this.type = null;
  }

  connectedCallback() {
    this.shadow.addEventListener('click', () => checkInput(this.letter));
  }

  static get observedAttributes() {
    return ['letter', 'type'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'letter' && oldValue == null) { this.onLetterInit(newValue); }
    if (name === 'type') { this.onTypeChange(oldValue, newValue); }
  }
}

customElements.define('key-component', Key);
