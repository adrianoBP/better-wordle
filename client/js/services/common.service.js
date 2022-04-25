'use strict';

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const allowLoading = () => {
  const savedDayWordIndex = getItem('game-day', false);

  // Don't load the game if we can't verify when the game was saved
  if (!savedDayWordIndex) return false;

  // Don't load the game if the day has changed since the last save
  if (savedDayWordIndex !== getDayFromMillisec().toString()) return false;

  return true;
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

export {
  sleep,
  allowLoading,
  getDayFromMillisec,

  setItem,
  getItem,
};
