import fs from 'fs';

function getFileContent(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

export { getFileContent };
