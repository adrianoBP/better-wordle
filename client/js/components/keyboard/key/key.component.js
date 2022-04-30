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
      <div></div>
      `;
  }

  get letter() {
    return this.getAttribute('letter');
  }

  set letter(letter) {
    this.setAttribute('letter', letter);
  }

  get type() {
    return this.getAttribute('type');
  }

  set type(type) {
    this.setAttribute('type', type);
  }

  onTypeChange(newType) {
    const keyElem = this.shadow.querySelector('div');

    if (newType === 'success') {
      // Remove warn in case the letter was already guessed but in the wrong position
      keyElem.classList.remove('warn');
      keyElem.classList.add('success');
      return;
    }

    if (newType === 'warn' && this.type !== 'success') {
      keyElem.classList.add('warn');
      return;
    }

    if (newType === 'fail' && this.type !== 'success' && this.type !== 'warn') {
      keyElem.classList.add('fail');
    }
  }

  onLetterInit(letter) {
    const keyElem = this.shadow.querySelector('div');

    keyElem.dataset.keyref = letter;

    switch (letter) {
      case 'backspace':
        keyElem.appendChild(backspaceSVG);
        keyElem.classList.add('icon');
        break;
      case 'enter':
        keyElem.appendChild(enterSVG);
        keyElem.classList.add('icon');
        break;
      default:
        keyElem.textContent = letter.toUpperCase();
    }
  }

  select() {
    const keyElem = this.shadow.querySelector('div');
    if (!keyElem.classList.contains('selected')) {
      keyElem.classList.add('selected');
    }
  }

  unselect() {
    this.shadow.querySelector('div').classList.remove('selected');
  }

  connectedCallback() {
    this.shadow.addEventListener('click', () => checkInput(this.letter));
  }

  static get observedAttributes() {
    return ['letter', 'type'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'letter' && oldValue == null) { this.onLetterInit(newValue); }
    if (name === 'type') {
      this.unselect();
      if (oldValue !== newValue) {
        this.onTypeChange(newValue);
      }
    }
  }
}

customElements.define('key-component', Key);
