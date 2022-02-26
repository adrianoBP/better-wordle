import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import router from './controllers/index.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api', router);

const PORT = process.env.PORT || 5001;
const IS_PROD = process.env.NODE_ENV === 'production';
const CLIENT_PATH = path.join(path.resolve(), './client/');

// Host run client from server
app.get('*', (req, res) => {
  res.sendFile(CLIENT_PATH, './client/index.html');
});
app.use(express.static(path.join(CLIENT_PATH, 'client/')));

if (IS_PROD) {
  // TODO: Add SSL
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
