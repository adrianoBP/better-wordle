'use strict';
import { showElement } from '../../../utils.js';

class LobbyDetails extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
    <style>
      @import url('js/components/game/lobby/lobby.component.css');
      @import url('css/style.css');
    </style>
    <section>
      <p id="players"></p>
      <button id="start-game" class="hidden" disabled>Start Game</button>
      <p id="additional-info"></p>
    </section>
    `;
  }

  get infoElem() { return this.shadow.querySelector('#additional-info'); }

  updateCountdown(newValue) {
    if (newValue) {
      this.infoElem.textContent = newValue;

      // Countdown animation
      this.infoElem.animate([
        { transform: 'scale(2)' },
        { transform: 'scale(0.2)' },
      ], { duration: 1000 });
    }
  }

  updatePlayersCount(value) {
    this.shadow.querySelector('#players').textContent = `${value} player(s) connected`;

    if (value >= 2 && this.startGame) {
      this.shadow.querySelector('#start-game').disabled = false;
    }
  }

  connectedCallback() {
    // If the user is allowed to start the game, show the start button
    if (this.startGame) {
      const startGameElem = this.shadow.querySelector('#start-game');
      showElement(startGameElem);
      startGameElem.addEventListener('click', () => {
        this.startGame();
      });
    } else {
      this.infoElem.textContent = 'Waiting for host ...';
    }
  }
}

customElements.define('game-lobby', LobbyDetails);
