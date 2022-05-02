import wordsService from './words.service.js';
import dbService from './db.service.js';
import { toBase64, sleep } from '../utils.js';
import { v4 as uuidv4 } from 'uuid';

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

const runningGames = {};

const onGameMessage = (socket) => {
  socket.on('message', async (message) => {
    const data = JSON.parse(message);

    switch (data.event) {
      case 'new-game': {
        const gameId = data.gameId || uuidv4();
        console.log(`New game ${gameId}`);

        if (!runningGames[gameId]) {
          runningGames[gameId] = {
            players: [],
            code: toBase64((await dbService.getNewWordId(data.difficulty, data.wordLength)).id),
            difficulty: data.difficulty,
            wordLength: data.wordLength,
          };
        }

        runningGames[gameId].players.push(socket);

        dispatchToAll(gameId, 'game-settings', {
          playerCount: runningGames[gameId].players.length,
          code: runningGames[gameId].code,
          gameId,
          difficulty: runningGames[gameId].difficulty,
          wordLength: runningGames[gameId].wordLength,
        });
        break;
      }
      case 'start-game': {
        for (let i = 3; i >= 0; i--) {
          dispatchToAll(data.gameId, 'countdown', { count: i });
          await sleep(1000);
        }
        break;
      }

      case 'game-end': {
        dispatchToAll(data.gameId, 'game-end', {
          guess: data.guess,
        }, socket);
      }
    }
  });
};

const dispatchToAll = (gameId, event, properties, socket) => {
  for (const client of runningGames[gameId].players) {
    if (socket && client === socket) { continue; }

    client.send(JSON.stringify({
      event,
      ...properties,
    }));
  }
};


export default {
  validateGuess,
  onGameMessage,
};
