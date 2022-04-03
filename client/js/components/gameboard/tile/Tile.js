import { flip as flipTile, shake as shakeTile } from '../../../services/animation.service.js';

class Tile {
  constructor() {
    this.htmlElement = document.createElement('div');
  }

  get letter() {
    return this.htmlElement.textContent;
  }

  set letter(letter) {
    this.htmlElement.textContent = letter;
  }

  get type() {
    return this.class;
  }

  flip(newType) {
    // flip tile can accept a type - If the type is not passed, the tile is gets reset
    flipTile(this.htmlElement, newType);
    if (newType) { this.class = newType; }
  }

  shake() {
    shakeTile(this.htmlElement);
  }

  removeClass(className) {
    this.htmlElement.classList.remove(className);
  }

  addClass(className) {
    this.htmlElement.classList.add(className);
  }
}

export default Tile;
