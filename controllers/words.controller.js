import { Router } from 'express';
import wordsService from '../services/words.service.js';

const router = new Router();

const getWordByHash = async (req, res) => {
  if (!req.is('application/json')) {
    res.status(400).json({
      error: 'Invalid request type. Please send a JSON request.',
    });
    return;
  }

  const dictionaryOptions = req.body;

  res.json({
    result: await wordsService.getWord(dictionaryOptions),
  });
};


router.post('/by-hash', getWordByHash);

export default router;
