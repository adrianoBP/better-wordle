import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { URL } from 'url';

const IN_FOLDER_PATH = new URL('../dictionaries/raw', import.meta.url).pathname;
const OUT_FOLDER_PATH = new URL('../dictionaries/filtered', import.meta.url).pathname;

fs.readdirSync(IN_FOLDER_PATH).forEach((fileName) => {
  const inFilePath = path.join(IN_FOLDER_PATH, fileName);
  const outFilePath = path.join(OUT_FOLDER_PATH, fileName);

  const lineReader = readline.createInterface({
    input: fs.createReadStream(inFilePath),
  });

  const result = [];

  lineReader.on('line', (line) => {
    const lower = line.toLowerCase();
    if (/^[a-z]{4,8}$/.test(lower)) {
      result.push(lower);
    }
  });

  lineReader.on('close', () => {
    // Shuffle the elements in the array
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    fs.writeFileSync(outFilePath, result.join('\n'));
  });
});
