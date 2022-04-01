'use strict';
import { setSetting } from './storage.service.js';
import Key from '../components/key/Key.js';

const keyBoard = {};

const initKeyboard = () => {
  const keyRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['backspace', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'enter'],
  ];

  keyRows.forEach((row, rowIndex) => {
    const rowElement = document.createElement('div');
    rowElement.classList.add('row');

    // Add extra class to the last row to allow css selectors to edit the larger buttons
    if (rowIndex === keyRows.length - 1) { rowElement.classList.add('last-row'); }

    row.forEach((letter) => {
      const key = new Key(letter);
      rowElement.appendChild(key.htmlElement);
      keyBoard[letter] = key;
    });

    document.querySelector('#keyboard').appendChild(rowElement);
  });

  // document.querySelectorAll('#keyboard > .row > div').forEach((el) => {
  //   keyBoard[el.textContent.toLowerCase()] = new Key(el);
  // });
};

const updateKeyboard = (letterResults) => {
  // TODO: check if this can be optimized

  letterResults.forEach(element => {
    keyBoard[element.letter].type = element.classResult;
  });
};

const selectKey = (letter) => {
  if (!keyBoard[letter]) return;
  keyBoard[letter].select();
};

const unselectKey = (letter) => {
  if (!keyBoard[letter]) return;
  keyBoard[letter].unselect();
};

const saveKeyboard = () => {
  const keyboardResult = [];
  Object.keys(keyBoard).forEach((letter) => {
    keyboardResult.push({ letter, type: keyBoard[letter].type });
  });

  setSetting('keyboard', keyboardResult);
};

export {
  initKeyboard,

  updateKeyboard,
  selectKey,
  unselectKey,

  saveKeyboard,
};
