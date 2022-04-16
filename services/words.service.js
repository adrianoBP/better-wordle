import dbService from '../services/db.service.js';

const getTodaysWord = async (dictionaryOptions) => {
  const { difficulty, wordLength } = dictionaryOptions;
  return await dbService.getTodaysWord(difficulty, wordLength);
};

const getWordByHash = async (hash) => {
  return await dbService.getWordByHash(hash);
};

const getWord = (dictionaryOptions) => {
  if (dictionaryOptions.hash) {
    return getWordByHash(dictionaryOptions.hash);
  } else {
    return getTodaysWord(dictionaryOptions);
  }
};


export default {
  getTodaysWord,
  getWordByHash,
  getWord,
};
