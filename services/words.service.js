import dbService from '../services/db.service.js';

const getTodaysWord = async () => {
  return await dbService.getTodaysWord();
};

const getWord = (code) => {
  // If the code is null, return today's word
  if (code) {
    return dbService.getWordById(code);
  } else {
    return getTodaysWord();
  }
};


export default {
  getTodaysWord,
  getWord,
};
