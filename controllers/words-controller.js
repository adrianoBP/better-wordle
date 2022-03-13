import { Router } from 'express';
import wordsService from '../services/words-service.js';

const router = new Router();

// ! Do we need this to be an API reachable from the frontend?
const getTodayWord = (req, res) => {
  res.json({
    word: wordsService.getTodayWord({
      lang: 'en_en',
      wordLength: 5,
    }),
  });
};

const validateWord = (req, res) => {
  // TODO: validate requests
  res.json({
    result: {
      isValid: wordsService.wordExists(req.body.word, req.body.dictionaryOptions),
    },
  });
};

router.get('/today', getTodayWord);
router.post('/validate', validateWord);

export default router;
