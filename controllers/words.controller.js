import { Router } from 'express';
import wordsService from '../services/words.service.js';

// ! #debug
import dbService from '../services/db.service.js';

const router = new Router();

const getTodaysWord = async (req, res) => {
  if (!req.is('application/json')) {
    res.status(400).json({
      error: 'Invalid request type. Please send a JSON request.',
    });
    return;
  }

  const dictionaryOptions = req.body;

  res.json({
    result: await wordsService.getTodaysWord(dictionaryOptions),
  });
};

// ! TODO: do we need this? Or can we just use the online validation one
const validateWord = async (req, res) => {
  // ! #debug
  const word = await dbService.findWord(req.body.word);
  res.json({
    result: word,
  });

  // res.json({
  //   result: {
  //     isValid: wordsService.wordExists(req.body.word, req.body.dictionaryOptions),
  //   },
  // });
};

router.post('/today', getTodaysWord);
router.post('/validate', validateWord);

export default router;
