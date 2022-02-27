import { Router } from 'express';
import gameService from '../services/game-service.js';

const router = new Router();

const validateGuess = (req, res) => {
  if (!req.is('application/json')) {
    res.status(400).json({
      error: 'Invalid request type. Please send a JSON request.',
    });
    return;
  }

  const { dictionaryOptions, guess } = req.body;

  // TODO: validate all parameters
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

router.post('/validate-guess', validateGuess);

export default router;
