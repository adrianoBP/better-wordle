import path from 'path';
import fs from 'fs';
import readline from 'readline';

const IN_FOLDER_PATH = path.join(path.resolve(), './words/raw');
const OUT_FOLDER_PATH = path.join(path.resolve(), './words/filtered');

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
    fs.writeFileSync(outFilePath, result.join('\n'));
  });
});
