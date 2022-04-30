'use strict';
import { resetGame, isLoading } from '../../services/game.service.js';
import { settings } from '../../services/settings.service.js';
import { getNewGameCode, getWord } from '../../services/api.service.js';
import '../menu/menu.component.js';

fetch('js/components/navbar/navbar.component.html')
  .then(stream => stream.text())
  .then(text => define(text));

const define = (template) => {
  class Navbar extends HTMLElement {
    constructor() {
      super();

      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = template;
    }

    hideMenu() {
      this.shadow.querySelector('sliding-menu').setAttribute('active', false);
    }

    connectedCallback() {
      const menu = this.shadow.querySelector('sliding-menu');
      menu.setAttribute('active', false);
      menu.setAttribute('settings', JSON.stringify(settings));

      this.shadow.querySelector('#random-game').addEventListener('click', async () => {
        if (isLoading) return;
        // Creates a new game - The game is not saved!
        settings.code = await getNewGameCode();

        resetGame(settings.code);
      });

      // ! #debug
      this.shadow.querySelector('#debug').addEventListener('click', async () => {
        console.log(await getWord(settings));
      });
    }
  }

  customElements.define('navbar-component', Navbar);
};
