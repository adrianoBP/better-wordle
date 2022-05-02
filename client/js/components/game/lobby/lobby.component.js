'use strict';
class LobbyDetails extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.render();
  }

  render() {
    this.shadow.innerHTML = `
    <style>
      @import url('js/components/game/lobby/lobby.component.css');
    </style>
    <section>
      <h2 id="players"></h2>
      <button id="start-game" style="display: none">Start Game</button>
      <p id="countdown" style="display: none"></p>
    </section>
    `;
  }

  get playersElem() { return this.shadow.querySelector('#players'); }
  get startGameElem() { return this.shadow.querySelector('#start-game'); }
  get countdownElem() { return this.shadow.querySelector('#countdown'); }

  get players() { return this.getAttribute('players'); }
  set players(value) { this.setAttribute('players', value); }

  get gameStarted() { return this.getAttribute('game-started') === 'true'; }
  set gameStarted(value) { this.setAttribute('game-started', value ? 'true' : 'false'); }

  show() {
    this.shadow.querySelector('section').style.display = 'flex';
  }

  hide() {
    this.shadow.querySelector('section').style.display = 'none';
  }

  connectedCallback() {
    // If the user is allowed to start the game, show the start button
    if (this.startGame) {
      this.startGameElem.style.display = 'block';
      this.shadow.querySelector('#start-game').addEventListener('click', () => {
        this.startGame();
        this.countdownElem.style.display = 'block';
      });
    }
  }

  static get observedAttributes() {
    return ['players', 'game-started'];
  }

  onPlayerCountChange() {
    this.playersElem.textContent = `${this.players} player(s)`;
  }

  updateCountdown(newValue) {
    if (newValue) {
      this.countdownElem.style.display = 'block';
      this.countdownElem.textContent = newValue;
    } else {
      this.countdownElem.style.display = 'none';
    }
  }


  attributeChangedCallback(name) {
    if (name === 'players') { this.onPlayerCountChange(); }
  }
}

customElements.define('game-lobby', LobbyDetails);
