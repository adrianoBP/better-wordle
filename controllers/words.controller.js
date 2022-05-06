import { Router } from 'express';
import wordsService from '../services/words.service.js';

const router = new Router();

const getWordById = async (req, res) => {
  const { id } = req.query;

  res.json({
    result: await wordsService.getWord(id),
  });
};

const verifyWordData = async (req, res) => {
  const { id, wordLength } = req.query;
  const word = await wordsService.getWord(id);
  res.json({
    result: word.length === parseInt(wordLength, 10),
  });
};

router.get('/by-id', getWordById);
router.get('/verify', verifyWordData);

export default router;
