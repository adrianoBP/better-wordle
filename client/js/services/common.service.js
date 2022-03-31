'use strict';
import { getSetting } from './storage.service.js';

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const allowLoading = () => {
  const saveTime = getSetting('save-game-time', false);

  // If we can't verify when the game was saved, don't load it
  if (!saveTime) return false;

  const saveTimeDate = new Date(saveTime);
  // If the day has changed since the last save, don't load it
  if (saveTimeDate.getDate() !== new Date().getDate()) return false;

  return true;
};
export {
  sleep,
  allowLoading,
};
