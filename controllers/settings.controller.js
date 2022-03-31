import { Router } from 'express';
import settingsService from '../services/settings.service.js';

const router = new Router();

// ! Do we need this to be an API reachable from the frontend?
const getAvailableLanguages = (req, res) => {
  res.json({
    result: settingsService.getAvailableLanguages(),
  });
};

router.get('/languages', getAvailableLanguages);

export default router;
