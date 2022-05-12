import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';

const init = async () => {
  const db = await sqlite.open({
    filename: './db.sqlite',
    // sqlite3 is no longer a dependency of sqlite, hence, we need to explicitly use it
    driver: sqlite3.Database,
  });
  return db;
};

const dbConnection = init();

// Pick a word that has not been picked within the last 365 days
const getNewWordId = async (difficulty, length) => {
  const db = await dbConnection;
  // date('now') is un UTC
  const result = await db.get(`
  SELECT id, word
  FROM Words 
  WHERE 
    (last_picked < date('now', '-365 day') OR last_picked IS NULL)
    AND difficulty <= ?
    AND w_length = ?
  ORDER BY RANDOM()
  LIMIT 1`, [difficulty, length]);
  return { id: result?.id, word: result?.word };
};

const getTodaysWord = async () => {
  const db = await dbConnection;
  const result = await db.get(`
  SELECT word 
  FROM Words 
  WHERE last_picked = date('now')
  LIMIT 1`);
  return result?.word;
};

const getWordById = async (id) => {
  const db = await dbConnection;
  const result = await db.get('SELECT word FROM Words WHERE id = ?', [id]);
  return result?.word;
};

const setTodayWord = async (id) => {
  const db = await dbConnection;
  const result = await db.run('UPDATE Words SET last_picked = date(\'now\') WHERE id = ?', [id]);
  return result;
};

export default {
  init,
  getTodaysWord,
  getNewWordId,
  getWordById,
  setTodayWord,
};
