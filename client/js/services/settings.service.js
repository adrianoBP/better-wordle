import { getItem, setItem, setTheme, deleteUrlParams } from '../utils.js';
import { verifyWordData } from './api.service.js';

let settings = {
  theme: 'dark',
  difficulty: 1,
  wordLength: 5,
  allowedGuessesCount: 6,
  gameTime: Date.now(),
  id: null,
  tileSelection: true,
  validateOnComplete: true,
  stats: {
    daily: {
      played: 0,
      won: 0,
      results: [0, 0, 0, 0, 0, 0],
    },
    multiplayer: {
      played: 0,
      won: 0,
      results: [0, 0, 0, 0, 0, 0],
    },
  },
  hapticFeedback: true,
  playAnimations: true,
};

const loadSettings = async () => {
  const savedSettings = getItem('settings');
  if (savedSettings) {
    settings = { ...settings, ...savedSettings };
    setTheme(settings.theme);
  } else {
    // If no settings are found, save the default ones
    saveSettings();
  }

  // If we are starting a game with an id, override the id but don't save in storage
  const searchParams = new URLSearchParams(window.location.search);

  if (searchParams.has('id') && searchParams.get('id') != null) {
    settings.id = searchParams.get('id');

    // Word length can only be specified with a valid id
    if (searchParams.has('length') && searchParams.get('length') != null) {
      settings.wordLength = parseInt(searchParams.get('length'), 10);
    }

    // Verify that the provided id is for the provided length
    if (settings.id && settings.wordLength) {
      const isValid = await verifyWordData(settings.id, settings.wordLength);
      if (!isValid) {
        deleteUrlParams();
        settings.id = null;
        settings.wordLength = 5;
        return;
      }
    }

    // Multiplayer code can only be present with a valid id
    if (searchParams.has('code')) {
      settings.code = searchParams.get('code');
    }
  }
};

const saveSettings = (newSettings) => {
  // Update the settings before saving them
  settings = { ...settings, ...newSettings };

  // Save only the necessary settings
  setItem('settings', {
    tileSelection: settings.tileSelection,
    validateOnComplete: settings.validateOnComplete,
    stats: settings.stats,
    theme: settings.theme,
    gameTime: settings.gameTime,
    hapticFeedback: settings.hapticFeedback,
    playAnimations: settings.playAnimations,
  });
};

export {
  settings,

  loadSettings,
  saveSettings,
};
