import wordsService from './words.service.js';
import dbService from './db.service.js';
import { sleep } from '../utils.js';

const validateGuess = async (guess, id) => {
  // Get the current word
  const word = await wordsService.getWord(id);

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
        const code = data.code || Math.random().toString(36).slice(2, 7);
        console.log(`New game - ${code}`);

        if (!runningGames[code]) {
          runningGames[code] = {
            players: [],
            id: (await dbService.getNewWordId(data.difficulty, data.wordLength)).id,
            difficulty: data.difficulty,
            wordLength: data.wordLength,
          };
        }

        runningGames[code].players.push(socket);

        dispatchToAll(code, 'game-settings', {
          playerCount: runningGames[code].players.length,
          id: runningGames[code].id,
          code,
          difficulty: runningGames[code].difficulty,
          wordLength: runningGames[code].wordLength,
        });
        break;
      }
      case 'start-game': {
        for (let i = 3; i >= 0; i--) {
          dispatchToAll(data.code, 'countdown', { count: i });
          await sleep(1000);
        }
        break;
      }

      case 'game-end': {
        dispatchToAll(data.code, 'game-end', {
          guess: data.guess,
        }, socket);
      }
    }
  });
};

const dispatchToAll = (code, event, properties, socket) => {
  for (const client of runningGames[code].players) {
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
