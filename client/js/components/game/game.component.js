'use strict';
import { settings, saveSettings } from '../../services/settings.service.js';
import { getWord } from '../../services/api.service.js';
import { sleep } from '../../utils.js';
import { socket } from '../../services/game.service.js';

import './board/board.component.js';
import './result/result.component.js';
import './lobby/lobby.component.js';

class GameDetails extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <section>
        <board-details></board-details>
        <result-details is-showing="false"></result-details>
      </section>
      `;
  }

  get boardElem() { return this.shadow.querySelector('board-details'); }
  get resultElem() { return this.shadow.querySelector('result-details'); }
  get lobbyElem() { return this.shadow.querySelector('game-lobby'); }

  get isGuessValid() { return this.getAttribute('is-guess-valid') === 'true'; }
  set isGuessValid(value) { this.setAttribute('is-guess-valid', value ? 'true' : 'false'); }

  get isMultiplayer() { return this.getAttribute('is-multiplayer') === 'true'; }
  set isMultiplayer(value) { this.setAttribute('is-multiplayer', value ? 'true' : 'false'); }


  async applyValidationResult(guess, validationResult, incrementWordIndex) {
    await this.boardElem.applyValidationResult(validationResult, incrementWordIndex);

    if (this.boardElem.wordGuessed || !this.boardElem.canInsert()) {
      // If the user didn't guess the word correctly, get it from the server
      if (!validationResult.every(x => x === 1)) {
        guess = await getWord(settings);
      }

      // Don't save the stats if it is a custom game
      if (!settings.code) {
        // TODO: Check if can be done better - i.e. as soon as the animation is complete
        await sleep(350);

        settings.stats.played++;
        settings.stats.won += this.boardElem.wordGuessed ? 1 : 0;
        settings.stats.results[this.boardElem.wordIndex - 1] += this.boardElem.wordGuessed ? 1 : 0;
        saveSettings();
      }

      // Only show the result if it is the current day word and not a random game
      this.showResult(guess, settings.code == null);

      // If the user guessed the word, notify all the other players (if playing in a lobby)
      if (this.boardElem.wordGuessed && settings.gameId != null) {
        socket.send(JSON.stringify({ event: 'game-end', gameId: settings.gameId, guess }));
        this.isMultiplayer = false;
      }
    }
  }

  async load(savedGame) {
    for (const row of savedGame) {
      // Convert the element type to a validation type (-1: not present, 0: wrong position, 1: correct position)
      row.forEach((letter) => {
        letter.value = letter.type === 'success' ? 1 : letter.type === 'warn' ? 0 : -1;
      });

      const validationResult = row.map((el) => el.value);
      this.boardElem.addWord(row.map((el) => el.letter), validationResult);
    }

    // TODO: Check if can be done better - i.e. as soon as the animation is complete
    await sleep(450 * settings.wordLength);

    if (this.boardElem.wordGuessed || !this.boardElem.canInsert()) {
      this.showResult(await getWord(settings), true);
    }
  }

  async restart() {
    this.boardElem.reset();
    this.isMultiplayer = false;
    if (this.resultElem.isShowing) { this.resultElem.hide(); }
    if (this.lobbyElem) { this.lobbyElem.remove(); }
    await sleep(500);
  }

  showResult(guess, showStats) {
    this.boardElem.hide();
    this.resultElem.show(guess, this.boardElem.wordGuessed, showStats);
  }

  newLobby(playerCount, isAdmin) {
    // If we played a game already, reset it
    if (this.lobbyElem) {
      this.lobbyElem.remove();
    }

    this.boardElem.hide();
    if (this.resultElem.isShowing) { this.resultElem.hide(); }

    const lobbyElem = document.createElement('game-lobby');
    lobbyElem.updatePlayersCount(playerCount);
    if (isAdmin) {
      lobbyElem.startGame = () => {
        socket.send(JSON.stringify({ event: 'start-game', gameId: settings.gameId }));
      };
    }

    // Make sure to append the element after defining the properties to ensure
    // that the connectedCallback() is called with the updated properties value
    this.shadow.querySelector('section').appendChild(lobbyElem);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.event) {
        case 'game-settings':
          lobbyElem.updatePlayersCount(data.playerCount);
          settings.difficulty = data.difficulty;
          settings.wordLength = data.wordLength;
          break;
        case 'countdown':
          lobbyElem.updateCountdown(data.count);
          if (data.count === 0) {
            this.isMultiplayer = true;
            this.lobbyElem.remove();
            this.boardElem.show();
          }
          break;
        case 'game-end':
          this.showResult(data.guess, settings.code == null);
          this.isMultiplayer = false;
          break;
      }
    };
  }

  onIsGuessValidChange() {
    if (!this.isGuessValid) {
      this.boardElem.markCurrentWordInvalid();
      if (settings.hapticFeedback) { window.navigator.vibrate(200); }
    }
  }

  static get observedAttributes() {
    return ['is-guess-valid'];
  }

  attributeChangedCallback(name) {
    if (name === 'is-guess-valid') { this.onIsGuessValidChange(); }
  }
}

customElements.define('game-component', GameDetails);
