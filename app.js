import express from 'express';
import dotenv from 'dotenv';
import { URL } from 'url';
import cors from 'cors';

import router from './controllers/index.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://127.0.0.1:5500', // live-server origin, used whilst testing
}));

app.use(express.json());
app.use('/api', router);

const PORT = process.env.PORT || 8080;
const CLIENT_FOLDER = new URL('client', import.meta.url)
  .pathname;

// Host static files
app.use(express.static(CLIENT_FOLDER));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
