import { getItem, setItem, setTheme } from './common.service.js';

let settings = {
  theme: 'dark',
  difficulty: 1,
  wordLength: 5,
  allowedGuessesCount: 6,
  gameTime: Date.now(),
  // used to restart the game with a different word for the same day - code is generated on the server
  code: null,
  tileSelection: true,
  validateOnComplete: true,
  stats: {
    played: 0,
    won: 0,
    results: [0, 0, 0, 0, 0, 0],
  },
};

const loadSettings = () => {
  const savedSettings = getItem('settings');
  if (savedSettings) {
    settings = { ...settings, ...savedSettings };
    setTheme(settings.theme);
  } else {
    // If no settings are found, save the default ones
    saveSettings();
  }

  // If we are starting a game with a code, override the code but don't save in memory
  const searchParams = new URLSearchParams(window.location.search);
  settings.code = searchParams.get('code');
  if (searchParams.has('length')) {
    settings.wordLength = parseInt(searchParams.get('length'));
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
  });
};

export {
  settings,

  loadSettings,
  saveSettings,
};
