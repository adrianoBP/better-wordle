'use strict';

class TileComponent extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'closed' });
  }

  render() {
    this.shadow.innerHTML = `
      <style>
        @import url('js/components/game/board/tile/tile.component.css');
      </style>
      <div>${this.letter}</div>
    `;

    this.renderComplete = true;
  }

  updateLetter() {
    this.shadow.querySelector('div').textContent = this.letter;
  }

  updateType() {
    const tile = this.shadow.querySelector('div');

    this.clearType();

    // Add class ony if the type is not empty - It can be empty when resetting the tile
    if (this.type) { tile.classList.add(this.type); }
  }

  clearType() {
    const tile = this.shadow.querySelector('div');
    ['success', 'warn', 'fail', 'error', 'selected'].forEach((className) => {
      tile.classList.remove(className);
    });
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

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ['letter', 'type'];
  }

  // No need to get old and new values as we are storing the data against the attribute
  attributeChangedCallback(name) {
    if (!this.renderComplete) { return; }
    if (name === 'letter') { this.updateLetter(); }
    if (name === 'type') { this.updateType(); }
  }
}

customElements.define('board-tile', TileComponent);
