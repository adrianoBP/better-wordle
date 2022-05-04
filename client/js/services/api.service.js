'use strict';
import { settings } from './settings.service.js';

// Since we are serving the client, we don't need to specify the full path (and will prevent issues with CORS)
const SERVICE_URL = '/api';

const makeRequest = async (url, method = 'GET', body = null, headers = {}) => {
  headers = {
    ...headers,
    'Content-Type': 'application/json',
  };

  const result = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  return result;
};

const makeRequestParse = async (url, method = 'GET', body = null, headers = {}) => {
  return await (await makeRequest(url, method, body, headers)).json();
};

const isWordValid = async (guess) => {
  const response = await makeRequest(
    `https://dictionary-dot-sse-2020.nw.r.appspot.com/${guess}`,
    'GET',
  );

  return response.status === 200;
};

const validateGuess = async (guess) => {
  return await makeRequestParse(
        `${SERVICE_URL}/game/validate-guess`,
        'POST', {
          guess,
          settings,
        },
  );
};

const getWord = async () => {
  // If no id is provided, today's word is returned
  const response = await makeRequestParse(
        `${SERVICE_URL}/words/by-id?id=${settings.id ? settings.id : ''}`,
        'GET',
  );

  if (response.error) {
    console.error(response.error);
    return;
  }

  return response.result;
};

const getNewGameCode = async () => {
  const response = await makeRequestParse(
    `${SERVICE_URL}/game/random?difficulty=${settings.difficulty}&wordLength=${settings.wordLength}`,
    'GET',
  );

  if (response.error) {
    console.error(response.error);
    return;
  }

  return response.result;
};

export {
  isWordValid,
  validateGuess,
  getWord,

  getNewGameCode,
};
