'use strict';
import { getItem } from './storage.service.js';

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

export {
  sleep,
  allowLoading,
  getDayFromMillisec,
};
