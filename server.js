import express from 'express';
import router from './controllers/index.js';
import { WebSocketServer } from 'ws';
import http from 'http';
import gameService from './services/game.service.js';

const app = express();
const PORT = 8080;

app.use(express.json());
app.use('/api', router);

// Host static files
app.use(express.static('client'));

// Base the server on express
const server = http.createServer(app);

// Websocket for multiplayer games
const socket = new WebSocketServer({ server });
socket.on('connection', gameService.onGameMessage);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
