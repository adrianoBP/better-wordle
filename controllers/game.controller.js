import { Router } from 'express';
import gameService from '../services/game.service.js';
import dbService from '../services/db.service.js';
import { getDateFromMillisec } from '../utils.js';

const router = new Router();

const validateGuess = async (req, res) => {
  const { settings, guess } = req.body;

  if (!guess) {
    res.status(400).json({
      error: 'Invalid request. Please send a guess in the request body.',
    });
    return;
  }

  // If the client time is out of sync and it is not a custom game (missing id), reject the guess
  if (!settings.id && getDateFromMillisec(settings?.gameTime) !== getDateFromMillisec()) {
    res.status(400).json({
      error: 'Invalid request. If you had the game open for too long, reload the page.',
    });
    return;
  }

  res.json({
    result: await gameService.validateGuess(guess, settings.id),
  });
};

const random = async (req, res) => {
  const { difficulty, wordLength } = req.query;

  if (!difficulty || !wordLength) {
    res.status(400).json({
      error: 'Invalid request. Please send a difficulty and word length in the query string.',
    });
    return;
  }


  res.json({
    result: (await dbService.getNewWordId(difficulty, wordLength)).id,
  });
};

router.post('/validate-guess', validateGuess);
router.get('/random', random);

export default router;
