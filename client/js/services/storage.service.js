'use strict';
const setItem = (key, value) => {
  if (typeof value === 'object') { value = JSON.stringify(value); }

  localStorage.setItem(key, value);
};

const getItem = (key, parse = true) => {
  if (parse) { return JSON.parse(localStorage.getItem(key)); }
  return localStorage.getItem(key);
};

export {
  setItem,
  getItem,
};
