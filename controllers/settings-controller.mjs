import { Router } from 'express';
import settingsService from '../services/settings-service.mjs';

const router = new Router();

// ! Do we need this to be an API reachable from the frontend?
const getAvailableLanguages = (req, res) => {
  res.json(settingsService.getAvailableLanguages());
};

router.get('/available-languages', getAvailableLanguages);

export default router;
