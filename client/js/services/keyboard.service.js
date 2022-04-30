'use strict';
const resetKeyboard = () => {
  document.querySelector('keyboard-component').reset();
};

const updateKeyboard = (letterResults) => {
  document.querySelector('keyboard-component').update(letterResults);
};

const selectKey = (letter) => {
  document.querySelector('keyboard-component').selectKey(letter);
};

const unselectKey = (letter) => {
  document.querySelector('keyboard-component').unselectKey(letter);
};

export {
  resetKeyboard,

  updateKeyboard,
  selectKey,
  unselectKey,
};
