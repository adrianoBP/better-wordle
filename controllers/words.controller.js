import { Router } from 'express';
import wordsService from '../services/words.service.js';

const router = new Router();


// ! TODO: do we need this? Or can we just use the online validation one
const validateWord = (req, res) => {
  res.json({
    result: {
      isValid: wordsService.wordExists(req.body.word, req.body.dictionaryOptions),
    },
  });
};

const randomHash = (req, res) => {
  if (!req.is('application/json')) {
    res.status(400).json({
      error: 'Invalid request type. Please send a JSON request.',
    });
    return;
  }

  const { dictionaryOptions } = req.body;

  res.json({
    result: wordsService.getRandomHash(dictionaryOptions),
  });
};

router.post('/validate', validateWord);
router.post('/random-hash', randomHash);

export default router;
