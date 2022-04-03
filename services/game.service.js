import wordsService from './words.service.js';

const validateGuess = (guess, dictionaryOptions, hash) => {
  if (dictionaryOptions.hash == null) {
    /* Base word selection on the current date - This should always be the server date,
    hence, it would reset at the same time for all users */
    const totalMillisecs = new Date().getTime();
    dictionaryOptions.hash = Math.floor(totalMillisecs / (1000 * 60 * 60 * 24));
  }

  const word = wordsService.getWordByHash(dictionaryOptions.hash, dictionaryOptions);

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
    hash,
  };
};

export default {
  validateGuess,
};
