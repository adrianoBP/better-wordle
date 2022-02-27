import wordsService from './words-service.js';

function validateGuess(guess) {
  const winningWord = wordsService.getTodayWord();

  const result = [];

  for (let i = 0; i < guess.length; i++) {
    const char = guess[i];

    if (winningWord[i] === char) {
      // Letter matches
      result[i] = 1;
    } else if (winningWord.includes(char)) {
      // Letter matches in the winning word, but incorrect position

      // ! If the user inserts a letter which is in the correct position
      // ! but later in the word, the letter will be marked as possible match.

      // If the character has already been checked, don't check it again
      if (guess.slice(0, i).includes(char)) { result[i] = -1; } else { result[i] = 0; }
    } else {
      // Letter does not match and not in winning word
      result[i] = -1;
    }
  }

  return result;
}

const service = {
  validateGuess,
};

export default service;
