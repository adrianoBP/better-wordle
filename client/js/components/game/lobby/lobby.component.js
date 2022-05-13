import { hideElement, showElement } from '../../../utils.js';

// Component: Lobby
// Description: Holds the information about the multiplayer lobby and renders the data

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
  get startGameElem() { return this.shadow.querySelector('#start-game'); }

  /**
   * Set the current value in the countdown and animates it by shrinking the text content
   * @param {String} newValue The new value to be displayed
   */
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
      this.startGameElem.disabled = false;
    }
  }

  connectedCallback() {
    // If the user is allowed to start the game, show the start button
    if (this.startGame) {
      showElement(this.startGameElem);
      this.startGameElem.addEventListener('click', () => {
        hideElement(this.startGameElem);
        this.startGame();
      });
    } else {
      this.infoElem.textContent = 'Waiting for host ...';
    }
  }
}

customElements.define('game-lobby', LobbyDetails);
