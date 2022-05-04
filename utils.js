'use strict';
import fs from 'fs';

const getDayFromMillisec = (millisec) => {
  if (millisec == null) { millisec = Date.now(); }
  return Math.floor(millisec / (1000 * 60 * 60 * 24));
};

const getFileContent = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export {
  getDayFromMillisec,
  getFileContent,

  sleep,
};
