'use strict';
import fs from 'fs';

const getDayFromMillisec = (millisec) => {
  if (millisec == null) { millisec = Date.now(); }
  return Math.floor(millisec / (1000 * 60 * 60 * 24));
};

const getFileContent = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

// atob() and btoa() are deprecated
const toBase64 = (content) => {
  if (content == null) { return null; }
  return Buffer.from(content.toString()).toString('base64');
};

const fromBase64 = (content) => {
  if (content == null) { return null; }
  return Buffer.from(content, 'base64').toString('utf8');
};

export {
  getDayFromMillisec,
  getFileContent,

  toBase64,
  fromBase64,
};
