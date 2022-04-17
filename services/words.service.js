import dbService from '../services/db.service.js';

const getTodaysWord = async (settings) => {
  const { difficulty, wordLength } = settings;
  return await dbService.getTodaysWord(difficulty, wordLength);
};

const getWordByHash = async (hash) => {
  return await dbService.getWordByHash(hash);
};

const getWord = (settings) => {
  if (settings.hash) {
    return getWordByHash(settings.hash);
  } else {
    return getTodaysWord(settings);
  }
};


export default {
  getTodaysWord,
  getWordByHash,
  getWord,
};
