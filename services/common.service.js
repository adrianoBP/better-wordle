'use strict';
import fs from 'fs';

const getDayFromMillisec = (millisec) => {
  if (millisec == null) { millisec = Date.now(); }
  return Math.floor(millisec / (1000 * 60 * 60 * 24));
};

const getFileContent = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

export {
  getDayFromMillisec,
  getFileContent,
};
