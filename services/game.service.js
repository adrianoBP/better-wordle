import wordsService from './words.service.js';
import dbService from './db.service.js';

const validateGuess = async (guess, settings) => {
  // Get the current word
  let word = await wordsService.getWord(settings.code);

  // If we don't a word, we need to pick a new one
  if (word == null) {
    const { id, word: newWord } = await dbService.getNewWordId(settings.difficulty, settings.wordLength);
    await dbService.setTodayWord(id);
    word = newWord;
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

  return result;
};

export default {
  validateGuess,
};
