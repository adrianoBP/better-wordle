'use strict';
import { setTheme } from '../../../utils.js';
import { applySettings } from '../../../services/game.service.js';
import { settings, saveSettings } from '../../../services/settings.service.js';
import '../../toggle/toggle.component.js';

fetch('js/components/navbar/menu/menu.component.html')
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

    async onActiveChange() {
      const menuToggle = this.shadow.querySelector('#menu-toggle');
      const menuElem = this.shadow.querySelector('section');

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
          theme: document.body.classList.contains('dark') ? 'dark' : 'light',
          wordLength: parseInt(this.shadow.querySelector('#word-length').value, 10),
          difficulty: parseInt(this.shadow.querySelector('#difficulty').value, 10),
        };
        await applySettings(newSettings);
        saveSettings(newSettings);
      }
    }

    connectedCallback() {
      setTheme(
        settings.theme,
        this.shadow.querySelector('#theme-switch'));

      // Init settings
      this.shadow.querySelector('#tile-selection')
        .setAttribute('checked', settings.tileSelection);
      this.shadow.querySelector('#validate-word')
        .setAttribute('checked', settings.validateOnComplete);
      this.shadow.querySelector('#haptic-feedback')
        ?.setAttribute('checked', settings.hapticFeedback);
      this.shadow.querySelector('#word-length').value = settings.wordLength;
      this.shadow.querySelector('#difficulty').value = settings.difficulty;

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

      // Update theme as soon as the icon is clicked instead of waiting for the menu to close
      this.shadow.querySelector('#theme-switch').addEventListener('click', (event) => {
        const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        setTheme(newTheme, event.target);
      });

      // Show haptic feedback option only if the user is on mobile
      if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        this.shadow.querySelectorAll('.menu-item')[3]?.remove();
      }
    }

    static get observedAttributes() {
      return ['active'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'active' &&
        oldValue != null &&
        oldValue !== newValue) { this.onActiveChange(); }
    }
  }

  customElements.define('sliding-menu', SlidingMenu);
};
