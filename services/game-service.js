import wordsService from './words-service.js';

function validateGuess(guess, dictionaryOptions) {
  const winningWord = wordsService.getTodayWord(dictionaryOptions);

  const result = [];
  const correctLetters = winningWord.split('').filter((letter) => guess.includes(letter));

  guess.forEach((letter, index) => {
    if (letter === winningWord[index]) {
      // Letter matches
      result.push(1);
    } else if (winningWord.includes(letter)) {
      // Letter matches in the winning word, but incorrect position

      // If the letter is already in the correct position or it has already been checked, don't show a warning
      if (!correctLetters.includes(letter) || winningWord.slice(0, index).includes(letter)) {
        result.push(-1);
      } else {
        result.push(0);
      }
    } else {
      // Letter does not match and not in winning word
      result.push(-1);
    }
  });

  return result;
}

export default {
  validateGuess,
};
