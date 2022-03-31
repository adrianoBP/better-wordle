import { Router } from 'express';
import wordsController from './words.controller.js';
import gameController from './game.controller.js';
import settingsController from './settings.controller.js';

const router = new Router();

router.use('/words', wordsController);
router.use('/game', gameController);
router.use('/settings', settingsController);

export default router;
