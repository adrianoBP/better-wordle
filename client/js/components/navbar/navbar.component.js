import { newRandomGame, isLoading } from '../../services/game.service.js';
import { settings } from '../../services/settings.service.js';
import { getNewGameCode } from '../../services/api.service.js';
import '../menu/menu.component.js';

// Component: Navigation bar
// Description: Holds the navigation bar for the game and its components

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

    get slidingMenuElem() { return this.shadow.querySelector('sliding-menu'); }

    hideMenu() {
      this.slidingMenuElem.setAttribute('active', false);
    }

    connectedCallback() {
      this.slidingMenuElem.setAttribute('active', false);

      this.shadow.querySelector('#random-game').addEventListener('click', async () => {
        if (isLoading) return;
        settings.id = await getNewGameCode();
        newRandomGame();
      });
    }
  }

  customElements.define('navbar-component', Navbar);
};
