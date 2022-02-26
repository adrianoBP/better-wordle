import { URL } from 'url';
import path from 'path';
import fs from 'fs';

const DICT_FOLDER = new URL('../dictionaries/filtered', import.meta.url)
  .pathname;

function getWordDictionary(lang, wordLength) {
  // Use defaults
  const selectedLang = `${lang ?? 'en_en'}.txt`;
  const selectedWordLength = wordLength ?? 5;

  // Load file content
  const filePath = path.join(DICT_FOLDER, selectedLang);
  const content = getFileContent(filePath);

  // Return only words of the selected length
  return content
    .split('\n')
    .filter((word) => word.length === selectedWordLength);
}

function getTodayWord() {
  // TODO: implement language and selection of word length

  const availableWords = getWordDictionary();

  // Base word selection on the current date
  // This should always be the server date, hence, it would reset at the same time for all users
  const totalMillisecs = new Date().getTime();
  const totalDays = Math.floor(totalMillisecs / (1000 * 60 * 60 * 24));
  const todayIndex = totalDays % availableWords.length;

  return availableWords[todayIndex];
}

function getFileContent(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

const service = {
  getWordDictionary,
  getTodayWord,
};

export default service;
