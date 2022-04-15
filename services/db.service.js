import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';

const init = async () => {
  const db = await sqlite.open({
    filename: './db.sqlite',
    // sqlite3 is no longer a dependency of sqlite, hence, we need to explicitly use it
    driver: sqlite3.Database,
  });

  await db.migrate({ migrationsPath: 'db/migrations' });
  return db;
};

const dbConnection = init();

const findWord = async (word) => {
  const db = await dbConnection;
  const result = await db.get(`SELECT * FROM words WHERE word = '${word}' LIMIT 1`);
  return result;
};

const getNewWordHash = async (difficulty, length) => {
  const db = await dbConnection;
  const result = await db.get(`
  SELECT id 
  FROM Words 
  WHERE 
    (last_picked < date('now', '-365 day') OR last_picked IS NULL)
    AND difficulty <= ?
    AND w_length = ?
  ORDER BY RANDOM()
  LIMIT 1`, [difficulty, length]);
  return result?.id;
};

const getTodaysWord = async (difficulty, length) => {
  const db = await dbConnection;
  const result = await db.get(`
  SELECT word 
  FROM Words 
  WHERE last_picked = date('now')
    AND difficulty <= ?
    AND w_length = ?
  LIMIT 1`, [difficulty, length]);
  return result?.word;
};

const getWordByHash = async (hash) => {
  const db = await dbConnection;
  const result = await db.get('SELECT word FROM Words WHERE id = ?', [hash]);
  return result.word;
};

const setTodayWord = async (hash) => {
  const db = await dbConnection;
  const result = await db.run('UPDATE Words SET last_picked = date(\'now\') WHERE id = ?', [hash]);
  return result;
};

export default {
  findWord,
  getTodaysWord,
  getNewWordHash,
  getWordByHash,
  setTodayWord,
};
