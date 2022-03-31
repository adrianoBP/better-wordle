import { Router } from 'express';
import gameService from '../services/game.service.js';

const router = new Router();

const validateGuess = (req, res) => {
  if (!req.is('application/json')) {
    res.status(400).json({
      error: 'Invalid request type. Please send a JSON request.',
    });
    return;
  }

  const { dictionaryOptions, guess } = req.body;

  if (!guess) {
    res.status(400).json({
      error: 'Invalid request. Please send a guess in the request body.',
    });
    return;
  }

  res.json({
    result: gameService.validateGuess(guess, dictionaryOptions),
  });
};

// TODO: Add async wrappers in all controllers to handle errors (only when async is being used)

router.post('/validate-guess', validateGuess);

export default router;
