import { hideElement, showElement } from '../../utils.js';
import './key/key.component.js';

class Keyboard extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>
        @import url('js/components/keyboard/keyboard.component.css');
        @import url('css/style.css');
      </style>
      <section></section>
      `;
    this.keyboard = {};
  }

  get keyboardElem() { return this.shadow.querySelector('section'); }

  update(letterResults) {
    letterResults.forEach(result => {
      this.keyboard[result.letter].type = result.type;
    });
  }

  reset() {
    Object.keys(this.keyboard).forEach(letter => {
      this.keyboard[letter].reset();
    });
  }

  show() { showElement(this.keyboardElem); }
  hide() { hideElement(this.keyboardElem); }


  selectKey(letter) {
    if (!this.keyboard[letter]) return;
    this.keyboard[letter].select();
  }

  unselectKey(letter) {
    if (!this.keyboard[letter]) return;
    this.keyboard[letter].unselect();
  }

  connectedCallback() {
    const keyRows = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['backspace', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'enter'],
    ];

    keyRows.forEach((row) => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('row');

      row.forEach((letter) => {
        const key = document.createElement('key-component');
        key.letter = letter;
        rowElement.appendChild(key);
        this.keyboard[letter] = key;
      });

      this.shadow.querySelector('section').appendChild(rowElement);
    });
  }
}

customElements.define('keyboard-component', Keyboard);
