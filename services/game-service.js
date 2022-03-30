import wordsService from './words-service.js';

const validateGuess = (guess, dictionaryOptions) => {
  const winningWord = wordsService.getTodayWord(dictionaryOptions);

  const result = [];
  const checkedLetters = [];

  guess.forEach((letter, index) => {
    // Letter matches
    if (letter === winningWord[index]) {
      result.push(1);
      checkedLetters.push(letter);
      return;
    }

    // Letter in winning word but in incorrect position and not already checked
    if (winningWord.includes(letter) && !checkedLetters.includes(letter)) {
      // Check the rest of the word
      for (let i = index + 1; i < guess.length; i++) {
        // If the letter is in the correct position later in the word, don't show a warning
        if (winningWord[i] === letter) {
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
