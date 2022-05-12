import { setTheme, sleep, isMobile } from '../../utils.js';
import { applySettings, newRandomGame, newMultiplayerGame, isLoading } from '../../services/game.service.js';
import { settings, saveSettings } from '../../services/settings.service.js';
import { getNewGameCode } from '../../services/api.service.js';
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

    get menuToggleElem() { return this.shadow.querySelector('#menu-toggle'); }
    get menuElem() { return this.shadow.querySelector('main'); }

    get themeSwitchElem() { return this.shadow.querySelector('#theme-switch'); }
    get tileSelectionElem() { return this.shadow.querySelector('#tile-selection'); }
    get validateWordElem() { return this.shadow.querySelector('#validate-word'); }
    get hapticFeedbackElem() { return this.shadow.querySelector('#haptic-feedback'); }
    get playAnimationsElem() { return this.shadow.querySelector('#play-animations'); }
    get wordLengthElem() { return this.shadow.querySelector('#word-length'); }
    get wordDifficultyElem() { return this.shadow.querySelector('#word-difficulty'); }

    initSettings() {
      this.tileSelectionElem.setAttribute('checked', settings.tileSelection);
      this.validateWordElem.setAttribute('checked', settings.validateOnComplete);
      this.hapticFeedbackElem?.setAttribute('checked', settings.hapticFeedback);
      this.playAnimationsElem?.setAttribute('checked', settings.playAnimations);
      this.wordLengthElem.value = settings.wordLength;
      this.wordDifficultyElem.value = settings.difficulty;
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

      setTheme(settings.theme, this.themeSwitchElem);
      this.onPlayAnimationChange(
        this.shadow.querySelector('main'),
        this.shadow.querySelector('#play-animations'));

      // Update theme as soon as the icon is clicked instead of waiting for the menu to close
      this.themeSwitchElem.addEventListener('click', (event) => {
        const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        setTheme(newTheme, event.target);
      });

      // Menu toggle
      this.menuToggleElem.addEventListener('click', () => {
        this.active = !this.active;
      });

      // Register menu toggle on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.active = !this.active;
        }
      });

      // Register screen switch
      this.shadow.querySelector('#section-switch')
        .addEventListener('click', this.switchMenu.bind(this));

      // Show haptic feedback option only if the user is on mobile
      if (!isMobile()) {
        this.shadow.querySelector('#haptic-feedback-item')?.remove();
      }

      // Register animations style change
      this.playAnimationsElem.toggleCallback = () => {
        this.onPlayAnimationChange(this.menuElem, this.playAnimationsElem);
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
      if (this.active) {
        this.menuToggleElem.classList.add('active');
        this.menuElem.classList.add('active');
      } else {
        this.menuToggleElem.classList.remove('active');
        this.menuElem.classList.remove('active');

        // Save settings once the settings page closes
        const newSettings = {
          tileSelection: this.tileSelectionElem.checked,
          validateOnComplete: this.validateWordElem.checked,
          hapticFeedback: this.hapticFeedbackElem?.checked || false,
          playAnimations: this.playAnimationsElem?.checked || false,
          theme: document.body.classList.contains('dark') ? 'dark' : 'light',
          wordLength: parseInt(this.wordLengthElem.value, 10),
          difficulty: parseInt(this.wordDifficultyElem.value, 10),
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
