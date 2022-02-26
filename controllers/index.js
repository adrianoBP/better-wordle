import { Router } from 'express';
import wordsController from './words-controller.js';

const router = new Router();

router.use('/words', wordsController);

export default router;
