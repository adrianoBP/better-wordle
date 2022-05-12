import { settings } from '../../../../services/settings.service.js';

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

  get tileElem() {
    return this.shadow.querySelector('div');
  }

  get letter() {
    return this.hasAttribute('letter') ? this.getAttribute('letter') : '';
  }

  set letter(letter) { this.setAttribute('letter', letter); }

  // 'type' indicates the kind of the tile: 'success', 'warn', 'fail'
  get type() { return this.getAttribute('type'); }
  set type(type) { this.setAttribute('type', type); }

  get isSelected() { return this.hasAttribute('selected'); }
  set isSelected(isSelected) { this.setAttribute('type', isSelected ? 'selected' : ''); }

  // Clear tile type and additional
  clearType() {
    this.tileElem.classList.remove('success', 'warn', 'fail', 'selected', 'error');
  }

  toggleSelection() {
    this.isSelected = !this.isSelected;
  }

  static get observedAttributes() {
    return ['letter', 'type'];
  }

  onLetterChange() {
    this.tileElem.textContent = this.letter;
  }

  onTypeChange() {
    this.clearType();

    // Add class ony if the type is not empty - It can be empty when resetting the tile
    if (this.type) { this.tileElem.classList.add(this.type); }
  }

  updateType(newType) {
    if (newType) {
      this.type = newType;
    } else {
      // If we don't pass a resultClass, we want to reset the tile
      this.type = '';
      this.letter = '';
    }
  }

  flip(newType) {
    if (!settings.playAnimations) {
      this.updateType(newType);
      return;
    }

    this.tileElem.classList.add('flip');

    // Remove the flip class to be able to re-flip it again
    this.tileElem.addEventListener('animationend', () => {
      this.tileElem.removeEventListener('animationend', () => {});
      this.tileElem.classList.remove('flip');
    });

    // Animations lasts .5s, half way through the animation, change the colour
    setTimeout(() => {
      this.updateType(newType);
    }, 250);
  }

  shake() {
    this.tileElem.animate([
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
