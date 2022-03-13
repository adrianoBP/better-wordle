'use strict';
function setSetting(key, value) {
  localStorage.setItem(key, value);
}

function getSetting(key) {
  JSON.parse(localStorage.getItem(key));
}

export default {
  setSetting,
  getSetting,
};
