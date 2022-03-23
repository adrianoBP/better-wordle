'use strict';
function setSetting(key, value) {
  if (typeof value === 'object') { value = JSON.stringify(value); }

  localStorage.setItem(key, value);
}

function getSetting(key, parse = true) {
  if (parse) { return JSON.parse(localStorage.getItem(key)); }
  return localStorage.getItem(key);
}

export {
  setSetting,
  getSetting,
};
