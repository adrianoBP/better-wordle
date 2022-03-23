'use strict';
function setSetting(key, value) {
  if (typeof value === 'object') { value = JSON.stringify(value); }

  localStorage.setItem(key, value);
}

function getSetting(key) {
  return JSON.parse(localStorage.getItem(key));
}

export {
  setSetting,
  getSetting,
};
