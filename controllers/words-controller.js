import { Router } from 'express';
import wordsService from '../services/words-service.js';

const router = new Router();

// ! Do we need this to be an API reachable from the frontend?
const getTodayWord = (req, res) => {
  res.json({
    word: wordsService.getTodayWord(),
  });
};

router.get('/today', getTodayWord);

export default router;
