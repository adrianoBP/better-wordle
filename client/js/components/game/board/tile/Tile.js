'use strict';
import { flip as flipTile, shake as shakeTile } from '../../../../services/animation.service.js';
import './tile.component.js';

class Tile {
  constructor(parentElement) {
    this.htmlElement = document.createElement('board-tile');
    this.htmlElement.setAttribute('letter', '');
    this.htmlElement.setAttribute('type', '');
    parentElement.appendChild(this.htmlElement);

    this.isSelected = false;
  }

  get letter() {
    return this.htmlElement.getAttribute('letter');
  }

  set letter(letter) {
    this.htmlElement.setAttribute('letter', letter);
  }

  get type() {
    return this.class;
  }

  set type(type) {
    // Do not trigger component update if not needed
    if (this.type === type) { return; }
    this.htmlElement.setAttribute('type', type);

    // If we don't pass the type, we are resetting the tile
    if (!type) { this.isSelected = false; }
  }

  async flip(newType, resolvePercentage) {
    // flip tile can accept a type - If the type is not passed, the tile gets reset
    await flipTile(this.htmlElement, newType, resolvePercentage);
    if (newType) { this.class = newType; }
  }

  shake() {
    shakeTile(this.htmlElement);
  }

  removeClass(className) {
    this.htmlElement.classList.remove(className);
  }

  toggleSelection() {
    this.isSelected = !this.isSelected;
    this.htmlElement.setAttribute('type', this.isSelected ? 'selected' : '');
  }

  forceTileSelection(tileSelected) {
    this.isSelected = tileSelected;
    this.htmlElement.setAttribute('type', tileSelected ? 'selected' : '');
  }
}

export default Tile;
