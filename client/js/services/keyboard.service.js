const resetKeyboard = () => {
  document.querySelector('keyboard-component').reset();
};

const updateKeyboard = (letterResults) => {
  document.querySelector('keyboard-component').update(letterResults);
};

const hideKeyboard = () => {
  document.querySelector('keyboard-component').hide();
};

const showKeyboard = () => {
  document.querySelector('keyboard-component').show();
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
  hideKeyboard,
  showKeyboard,
  selectKey,
  unselectKey,
};
