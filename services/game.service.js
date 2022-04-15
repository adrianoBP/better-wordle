import wordsService from './words.service.js';
import dbService from './db.service.js';

const validateGuess = async (guess, dictionaryOptions) => {
  let word = null;

  if (dictionaryOptions.hash) {
    word = await dbService.getWordByHash(dictionaryOptions.hash);
  } else {
    word = await wordsService.getTodaysWord(dictionaryOptions);
  }

  if (word == null) {
    const todaysHash = await pickTodaysHash(dictionaryOptions);
    word = await wordsService.getWordByHash(todaysHash);
  }

  const result = [];
  const checkedLetters = [];

  guess.forEach((letter, index) => {
    // Letter matches
    if (letter === word[index]) {
      result.push(1);
      checkedLetters.push(letter);
      return;
    }

    // Letter in winning word but in incorrect position and not already checked
    if (word.includes(letter) && !checkedLetters.includes(letter)) {
      // Check the rest of the word
      for (let i = index + 1; i < guess.length; i++) {
        // If the letter is in the correct position later in the word, don't show a warning
        if (guess[i] === letter && word[i] === guess[i]) {
          result.push(-1);
          checkedLetters.push(letter);
          return;
        }
      }

      // If the is not in the correct position later in the word, show a warning
      result.push(0);
      checkedLetters.push(letter);
      return;
    }

    // Letter already checked or not in winning word
    result.push(-1);
  });

  return {
    validation: result,
    hash: dictionaryOptions.hash,
  };
};

const pickTodaysHash = async (dictionaryOptions) => {
  const newHash = await randomHash(dictionaryOptions);
  await dbService.setTodayWord(newHash);
  return newHash;
};

const randomHash = async (dictionaryOptions) => {
  return await dbService.getNewWordHash(dictionaryOptions.difficulty, dictionaryOptions.wordLength);
};

export default {
  validateGuess,
  randomHash,
};
