import { Router } from 'express';
import gameService from '../services/game.service.js';
import { getDayFromMillisec } from '../services/common.service.js';

const router = new Router();

const validateGuess = async (req, res) => {
  if (!req.is('application/json')) {
    res.status(400).json({
      error: 'Invalid request type. Please send a JSON request.',
    });
    return;
  }

  const { settings, guess, hash } = req.body;

  if (!guess) {
    res.status(400).json({
      error: 'Invalid request. Please send a guess in the request body.',
    });
    return;
  }

  if (getDayFromMillisec(settings?.gameTime) !== getDayFromMillisec()) {
    res.status(400).json({
      error: 'Invalid request. If you had the game open for too long, reload the page.',
    });
    return;
  }

  res.json({
    result: await gameService.validateGuess(guess, settings, hash),
  });
};

const randomHash = async (req, res) => {
  if (!req.is('application/json')) {
    res.status(400).json({
      error: 'Invalid request type. Please send a JSON request.',
    });
    return;
  }

  const { settings } = req.body;

  res.json({
    result: await gameService.randomHash(settings),
  });
};

// TODO: Add async wrappers in all controllers to handle errors (only when async is being used)

router.post('/validate-guess', validateGuess);
router.post('/random-hash', randomHash);

export default router;
