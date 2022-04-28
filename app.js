import express from 'express';
import router from './controllers/index.js';

const app = express();
const PORT = 8080;

app.use(express.json());
app.use('/api', router);

// Host static files
app.use(express.static('client'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
