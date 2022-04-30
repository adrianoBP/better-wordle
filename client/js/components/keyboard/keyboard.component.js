// import Key from '../key/Key.js';
import './key/key.component.js';

class Keyboard extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>
        @import url('js/components/keyboard/keyboard.component.css');
      </style>
      <section></section>
      `;
    this.keyboard = {};
  }

  init() {
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

  update(letterResults) {
    // TODO: check if this can be optimized

    letterResults.forEach(element => {
      this.keyboard[element.letter].type = element.classResult;
    });
  }

  reset() {
    this.shadow.querySelector('section').replaceChildren([]);
    this.init();
  }

  selectKey(letter) {
    if (!this.keyboard[letter]) return;
    this.keyboard[letter].select();
  }

  unselectKey(letter) {
    if (!this.keyboard[letter]) return;
    this.keyboard[letter].unselect();
  }

  connectedCallback() {
    this.init();
  }
}

customElements.define('keyboard-component', Keyboard);
