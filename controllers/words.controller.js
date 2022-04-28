import { Router } from 'express';
import wordsService from '../services/words.service.js';
import { fromBase64 } from '../services/common.service.js';

const router = new Router();

const getWordByCode = async (req, res) => {
  const { code } = req.query;

  res.json({
    result: await wordsService.getWord(fromBase64(code)),
  });
};


router.get('/by-code', getWordByCode);

export default router;
