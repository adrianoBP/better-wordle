import express from 'express';
import dotenv from 'dotenv';
import { URL } from 'url';

import router from './controllers/index.mjs';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api', router);

const PORT = process.env.PORT || 8080;
const CLIENT_FOLDER = new URL('client', import.meta.url)
  .pathname;

// Host static files
app.get('/', (_, res) => {
  res.sendFile(`${CLIENT_FOLDER}/index.html`);
});
app.use(express.static(CLIENT_FOLDER));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});