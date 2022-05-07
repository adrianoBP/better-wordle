'use strict';
import { setTheme, sleep, isMobile } from '../../utils.js';
import { applySettings, newRandomGame, newMultiplayerGame, isLoading } from '../../services/game.service.js';
import { settings, saveSettings } from '../../services/settings.service.js';
import { getWord, getNewGameCode } from '../../services/api.service.js';
import '../toggle/toggle.component.js';
import '../game/board/tile/tile.component.js';

fetch('js/components/menu/menu.component.html')
  .then(stream => stream.text())
  .then(text => define(text));

const define = (template) => {
  class SlidingMenu extends HTMLElement {
    constructor() {
      super();

      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = template;
    }

    get active() { return this.getAttribute('active') === 'true'; }
    set active(value) { this.setAttribute('active', value); }

    initSettings() {
      this.shadow.querySelector('#tile-selection')
        .setAttribute('checked', settings.tileSelection);
      this.shadow.querySelector('#validate-word')
        .setAttribute('checked', settings.validateOnComplete);
      this.shadow.querySelector('#haptic-feedback')
        ?.setAttribute('checked', settings.hapticFeedback);
      this.shadow.querySelector('#play-animations')
        ?.setAttribute('checked', settings.playAnimations);
      this.shadow.querySelector('#word-length').value = settings.wordLength;
      this.shadow.querySelector('#difficulty').value = settings.difficulty;
    }

    switchMenu(event) {
      const settingsElem = this.shadow.querySelector('#settings');
      const tutorialElem = this.shadow.querySelector('#tutorial');

      if (settingsElem.classList.contains('out')) {
        settingsElem.classList.remove('out');
        tutorialElem.classList.add('out');
        event.target.textContent = 'How to play';
      } else {
        settingsElem.classList.add('out');
        tutorialElem.classList.remove('out');
        event.target.textContent = 'Settings';

        sleep(200).then(() => {
          tutorialElem.querySelectorAll('board-tile').forEach((tile) => {
            tile.flip(tile.type);
          });
        });
      }
    }

    connectedCallback() {
      this.initSettings();

      setTheme(
        settings.theme,
        this.shadow.querySelector('#theme-switch'));
      this.onPlayAnimationChange(
        this.shadow.querySelector('main'),
        this.shadow.querySelector('#play-animations'));

      // Update theme as soon as the icon is clicked instead of waiting for the menu to close
      this.shadow.querySelector('#theme-switch').addEventListener('click', (event) => {
        const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        setTheme(newTheme, event.target);
      });

      // Menu toggle
      this.shadow.querySelector('#menu-toggle').addEventListener('click', () => {
        this.active = !this.active;
      });

      // Register menu toggle on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.active = !this.active;
        }
      });

      // Register screen switch
      this.shadow.querySelector('#switch')
        .addEventListener('click', this.switchMenu.bind(this));

      // Show haptic feedback option only if the user is on mobile
      if (!isMobile()) {
        this.shadow.querySelectorAll('#settings .item')[3]?.remove();
      }

      // Register animations style change
      this.shadow.querySelector('#play-animations').toggleCallback = () => {
        this.onPlayAnimationChange(this.shadow.querySelector('main'), this.shadow.querySelector('#play-animations'));
      };

      // Register game modes
      this.shadow.querySelector('#random-game').addEventListener('click', async () => {
        if (!isLoading) {
          settings.id = await getNewGameCode();
          newRandomGame();
          this.active = false;
        }
      });

      this.shadow.querySelector('#multiplayer-game').addEventListener('click', () => {
        if (!isLoading) {
          this.active = false;
          newMultiplayerGame(true);
        }
      });

      // ! #debug
      this.shadow.querySelector('#debug').addEventListener('click', async () => {
        console.log(await getWord(settings));
      });
    }

    onPlayAnimationChange(menuElem, toggleElem) {
      if (!toggleElem.checked && !menuElem.classList.contains('no-animations')) {
        menuElem.classList.add('no-animations');
      } else {
        menuElem.classList.remove('no-animations');
      }
      settings.playAnimations = toggleElem.checked;
    }

    static get observedAttributes() {
      return ['active'];
    }

    async onActiveChange() {
      const menuToggle = this.shadow.querySelector('#menu-toggle');
      const menuElem = this.shadow.querySelector('main');

      if (this.active) {
        menuToggle.classList.add('active');
        menuElem.classList.add('active');
      } else {
        menuToggle.classList.remove('active');
        menuElem.classList.remove('active');

        // Save settings once the settings page closes
        const newSettings = {
          tileSelection: this.shadow.querySelector('#tile-selection').checked,
          validateOnComplete: this.shadow.querySelector('#validate-word').checked,
          hapticFeedback: this.shadow.querySelector('#haptic-feedback')?.checked || false,
          playAnimations: this.shadow.querySelector('#play-animations')?.checked || false,
          theme: document.body.classList.contains('dark') ? 'dark' : 'light',
          wordLength: parseInt(this.shadow.querySelector('#word-length').value, 10),
          difficulty: parseInt(this.shadow.querySelector('#difficulty').value, 10),
        };
        await applySettings(newSettings);
        saveSettings(newSettings);
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'active' &&
        oldValue != null &&
        oldValue !== newValue) { this.onActiveChange(); }
    }
  }

  customElements.define('sliding-menu', SlidingMenu);
};
