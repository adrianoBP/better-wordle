import wordsService from './words-service.js';

function validateGuess(guess, dictionaryOptions) {
  const winningWord = wordsService.getTodayWord(dictionaryOptions);

  const result = [];
  const foundLetters = [];

  guess.forEach((letter, index) => {
    // Letter matches
    if (letter === winningWord[index]) {
      result.push(1);
      foundLetters.push(letter);
      return;
    }

    // Letter in winning word but in incorrect position
    if (winningWord.includes(letter)) {
      // If the letter has not been checked already, show letter as present in the word
      if (!foundLetters.includes(letter)) {
        result.push(0);
        foundLetters.push(letter);
      } else {
        result.push(-1);
      }
      return;
    }

    // Letter does not match and not in winning word
    result.push(-1);
  });

  return result;
}

export default {
  validateGuess,
};
