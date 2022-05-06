import dbService from '../services/db.service.js';

// Save todays word in memory to prevent DB lookup on every request
const todayWordData = {
  word: null,
  date: null,
};

const getTodaysWord = async () => {
  // If the saved word is from today, then return it
  if (todayWordData.word && todayWordData.date === new Date().toDateString()) {
    return todayWordData.word;
  }

  let word = await dbService.getTodaysWord();

  // If we don't a word, we need to pick a new one
  if (word == null) {
    const { id, word: newWord } = await dbService.getNewWordId(1, 5);
    await dbService.setTodayWord(id);
    word = newWord;
  }

  todayWordData.word = word;
  todayWordData.date = new Date().toDateString();

  return word;
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
