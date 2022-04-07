import { URL } from 'url';
import fs from 'fs';

const DICT_FOLDER = new URL('../misc/dictionaries/filtered', import.meta.url)
  .pathname;

const getWordDictionary = (dictionaryOptions) => {
  const { lang, wordLength } = dictionaryOptions;
  // Use defaults
  const langFile = `${lang ?? 'en_en'}.txt`;
  const selectedWordLength = wordLength ?? 5;

  // Load file content
  const filePath = `${DICT_FOLDER}/${langFile}`;
  const content = getFileContent(filePath);

  // Return only words of the selected length
  return content
    .split('\n')
    .filter((word) => word.length === selectedWordLength);
};

const getWordByHash = (dictionaryOptions) => {
  // TODO: implement language and selection of word length - #3
  // TODO: check if there's a better way to select a random word

  if (dictionaryOptions.hash == null) {
    /* Base word selection on the current date - This should always be the server date,
    hence, it would reset at the same time for all users */
    const totalMillisecs = new Date().getTime();
    dictionaryOptions.hash = Math.floor(totalMillisecs / (1000 * 60 * 60 * 24));
  }

  // Note: words are already shuffled
  const availableWords = getWordDictionary(dictionaryOptions);
  return availableWords[dictionaryOptions.hash % availableWords.length];
};

const wordExists = (word, dictionaryOptions) => {
  const availableWords = getWordDictionary(dictionaryOptions);
  return availableWords.includes(word);
};

const getRandomHash = (dictionaryOptions) => {
  const availableWords = getWordDictionary(dictionaryOptions);
  return Math.floor(Math.random() * availableWords.length);
};

const getFileContent = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

export default {
  getWordDictionary,
  getWordByHash,
  wordExists,
  getRandomHash,
};
