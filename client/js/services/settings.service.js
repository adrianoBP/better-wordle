import { getItem, setItem } from './storage.service.js';
import { setTheme } from './ui.service.js';

let settings = {
  theme: 'dark',
  difficulty: 1,
  wordLength: 5,
  allowedGuessesCount: 6,
  gameTime: Date.now(),
  hash: null, // used to restart the game with a different word for the same day - hash should generated on the server
  tileSelection: true,
  stats: {
    played: 0,
    won: 0,
    results: [0, 0, 0, 0, 0, 0],
  },
};

const loadSettings = () => {
  const savedSettings = getItem('settings');
  if (savedSettings) {
    settings = savedSettings;
    setTheme(settings.theme);
  }
};

const saveSettings = (newSettings) => {
  // Update the settings before saving them
  settings = { ...settings, ...newSettings };

  // Never save the hash to prevent errors on loading
  setItem('settings', { ...settings, hash: null });
};

export {
  settings,

  loadSettings,
  saveSettings,
};
