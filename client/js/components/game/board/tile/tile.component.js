'use strict';
class TileComponent extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'closed' });
    this.shadow.innerHTML = `
    <style>
      @import url('js/components/game/board/tile/tile.component.css');
    </style>
    <div>${this.letter}</div>
  `;
  }

  get letter() {
    return this.hasAttribute('letter') ? this.getAttribute('letter') : '';
  }

  set letter(letter) { this.setAttribute('letter', letter); }

  get type() { return this.getAttribute('type'); }
  set type(type) { this.setAttribute('type', type); }

  get isSelected() { return this.hasAttribute('selected'); }
  set isSelected(isSelected) { this.setAttribute('type', isSelected ? 'selected' : ''); }

  clearType() {
    const tile = this.shadow.querySelector('div');
    ['success', 'warn', 'fail', 'error', 'selected'].forEach((className) => {
      tile.classList.remove(className);
    });
  }

  toggleSelection() {
    this.isSelected = !this.isSelected;
  }

  static get observedAttributes() {
    return ['letter', 'type'];
  }

  onLetterChange() {
    this.shadow.querySelector('div').textContent = this.letter;
  }

  onTypeChange() {
    const tile = this.shadow.querySelector('div');
    this.clearType();

    // Add class ony if the type is not empty - It can be empty when resetting the tile
    if (this.type) { tile.classList.add(this.type); }
  }

  flip(newType) {
    const tile = this.shadow.querySelector('div');
    tile.classList.add('flip');

    // Remove the flip class to be able to re-flip it again
    tile.addEventListener('animationend', () => {
      tile.removeEventListener('animationend', () => {});
      tile.classList.remove('flip');
    });

    // Animations lasts .5s, half way through the animation, change the colour
    setTimeout(() => {
      if (newType) {
        this.type = newType;
      } else {
        // If we don't pass a resultClass, we want to reset the tile
        this.type = '';
        this.letter = '';
      }
    }, 250);
  }

  shake() {
    const tile = this.shadow.querySelector('div');
    tile.animate([
      { transform: 'translateX(-0.2em)' },
      { transform: 'translateX(0.2em)' },
      { transform: 'translateX(0)' },
    ],
    {
      duration: 200,
      iterations: 2,
    });
  }

  // No need to get old and new values as we are storing the data against the attribute
  attributeChangedCallback(name, oldValue, newValue) {
    if (!oldValue && !newValue) { return; }

    if (name === 'letter' && oldValue != null) { this.onLetterChange(); }
    if (name === 'type') { this.onTypeChange(); }
  }
}

customElements.define('board-tile', TileComponent);
