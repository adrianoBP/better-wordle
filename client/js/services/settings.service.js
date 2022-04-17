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
};

const loadSettings = () => {
  const savedSettings = getItem('settings');
  if (savedSettings) {
    settings = savedSettings;
    setTheme(settings.theme);
  }
};

const saveSettings = (newSettings) => {
  // Never save the hash to prevent errors on loading
  settings = { ...settings, ...newSettings, hash: null };
  setItem('settings', settings);
};

export {
  settings,

  loadSettings,
  saveSettings,
};
