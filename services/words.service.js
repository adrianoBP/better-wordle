import dbService from '../services/db.service.js';

const getTodaysWord = async () => {
  return await dbService.getTodaysWord();
};

const getWord = (id) => {
  // If the id is null, return today's word
  if (id) {
    return dbService.getWordById(id);
  } else {
    return getTodaysWord();
  }
};

export default {
  getTodaysWord,
  getWord,
};
