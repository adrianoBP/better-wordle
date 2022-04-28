'use strict';

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getDayFromMillisec = (millisec) => {
  if (millisec == null) { millisec = Date.now(); }
  return Math.floor(millisec / (1000 * 60 * 60 * 24));
};

const setItem = (key, value) => {
  if (typeof value === 'object') { value = JSON.stringify(value); }

  localStorage.setItem(key, value);
};

const getItem = (key, parse = true) => {
  if (parse) { return JSON.parse(localStorage.getItem(key)); }
  return localStorage.getItem(key);
};

const setTheme = (theme, element) => {
  if (theme == null) { theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }

  document.body.classList.remove('dark');
  document.body.classList.remove('light');
  document.body.classList.add(theme);

  if (element != null) {
    if (theme === 'dark') {
      element.src = '../../resources/icons/half-moon.svg';
    } else if (theme === 'light') {
      element.src = '../../resources/icons/sun.svg';
    }
  }
};

export {
  sleep,
  getDayFromMillisec,

  setItem,
  getItem,

  setTheme,
};
