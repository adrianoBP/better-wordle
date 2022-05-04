import { Router } from 'express';
import wordsService from '../services/words.service.js';

const router = new Router();

const getWordById = async (req, res) => {
  const { id } = req.query;

  res.json({
    result: await wordsService.getWord(id),
  });
};


router.get('/by-id', getWordById);

export default router;
