import dbService from '../services/db.service.js';

const getTodaysWord = async (dictionaryOptions) => {
  const { difficulty, wordLength } = dictionaryOptions;
  return await dbService.getTodaysWord(difficulty, wordLength);
};

const getWordByHash = async (hash) => {
  return await dbService.getWordByHash(hash);
};


export default {
  getTodaysWord,
  getWordByHash,
};
