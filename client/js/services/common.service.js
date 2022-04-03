'use strict';
import { getSetting } from './storage.service.js';

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const allowLoading = () => {
  const savedDayWordIndex = getSetting('game-day', false);

  // If we can't verify when the game was saved, don't load it
  if (!savedDayWordIndex) return false;

  // If the day has changed since the last save, don't load it
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
