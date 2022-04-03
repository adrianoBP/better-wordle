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
    flipTile(this.htmlElement, newType);
    this.class = newType;
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
