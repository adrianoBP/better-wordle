import * as logService from './log.service.js';
import { dictionaryOptions } from './game.service.js';

// Since we are serving the client, we don't need to specify the full path (and will prevent issues with CORS)
const SERVICE_URL = '/api';

const makeRequest = async (url, method = 'GET', body = null, headers = {}) => {
  // All requests will be done using JSON

  headers = {
    ...headers,
    'Content-Type': 'application/json',
  };

  return (await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })).json();
};

const validateWord = async (guess) => {
  const response = await makeRequest(
        `${SERVICE_URL}/words/validate`,
        'POST', {
          word: guess,
          dictionaryOptions,
        },
  );

  if (response.error) {
    logService.error(response.error);
    return;
  }

  return response.result;
};

const validateGuess = async (guess) => {
  const response = await makeRequest(
        `${SERVICE_URL}/game/validate-guess`,
        'POST', {
          guess,
          dictionaryOptions,
        },
  );

  if (response.error) {
    logService.error(response.error);
    return;
  }

  return response.result;
};

const getTodayWord = async () => {
  const response = await makeRequest(
        `${SERVICE_URL}/words/today`,
        'GET',
  );

  if (response.error) {
    logService.error(response.error);
    return;
  }

  return response.result;
};

export {
  validateWord,
  validateGuess,
  getTodayWord,
};
