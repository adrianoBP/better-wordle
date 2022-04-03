import { backspaceSVG, enterSVG } from '../../svg/index.js';
import { checkInput } from '../../services/game.service.js';

class Key {
  constructor(letter, type) {
    this.letter = letter;

    this.element = document.createElement('div');
    this.element.dataset.keyref = letter;

    if (letter === 'backspace') {
      this.element.appendChild(backspaceSVG);
    } else if (letter === 'enter') {
      this.element.appendChild(enterSVG);
    } else {
      this.element.textContent = letter.toUpperCase();
    }

    this.isSelected = false;

    if (type) { this.type = type; }

    this.element.addEventListener('click', () => checkInput(this.letter));
  }

  select() {
    this.isSelected = true;
    this.element.classList.add('selected');
  }

  unselect() {
    this.isSelected = false;
    this.element.classList.remove('selected');
  }

  get htmlElement() {
    return this.element;
  }

  get type() {
    if (this.element.classList.contains('success')) return 'success';
    else if (this.element.classList.contains('warn')) return 'warn';
    else if (this.element.classList.contains('fail')) return 'fail';
    return '';
  }

  set type(type) {
    this.element.classList.remove('selected');

    // TODO: Check if this can be optimized

    // Don't add the same class again
    if (this.element.classList.contains('success') && type === 'success') { return; }
    if (this.element.classList.contains('warn') && type === 'warn') { return; }
    if (this.element.classList.contains('fail') && type === 'fail') { return; }

    if (type === 'success') {
      this.element.classList.remove('fail');
      this.element.classList.remove('warn');
      this.element.classList.add('success');
      return;
    }

    if (type === 'warn' && !this.element.classList.contains('success')) {
      this.element.classList.remove('fail');
      this.element.classList.add('warn');
      return;
    }

    if (type === 'fail' && !this.element.classList.contains('warn') && !this.element.classList.contains('success')) {
      this.element.classList.add('fail');
    }
  }
}

export default Key;