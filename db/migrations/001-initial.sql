-- Up

CREATE TABLE Words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  difficulty INTEGER NOT NULL, -- 1: easy 2: medium 3: hard
  w_length INTEGER NOT NULL,
  last_picked DATE
);

-- Down

DROP TABLE Words;