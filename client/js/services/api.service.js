'use strict';
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

const validateWord = async (guess) => {
  // TODO: what about other languages?
  const response = await makeRequest(
    `https://dictionary-dot-sse-2020.nw.r.appspot.com/${guess}`,
    'GET',
  );

  return response.status === 200;
};

const validateGuess = async (guess, hash) => {
  return await makeRequestParse(
        `${SERVICE_URL}/game/validate-guess`,
        'POST', {
          guess,
          dictionaryOptions,
          hash,
        },
  );
};

const getTodayWord = async () => {
  const response = await makeRequestParse(
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
