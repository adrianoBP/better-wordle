'use strict';

import { setTheme } from '../../services/ui.service.js';
import { applySettings } from '../../services/game.service.js';
import { settings, saveSettings } from '../../services/settings.service.js';
import '../toggle/toggle.component.js';

fetch('js/components/menu/menu.component.html')
  .then(stream => stream.text())
  .then(text => define(text));

const define = (template) => {
  class SlidingMenu extends HTMLElement {
    constructor() {
      super();

      this.shadow = this.attachShadow({ mode: 'open' });
      this.shadow.innerHTML = template;

      setTheme(
        settings.theme,
        this.shadow.querySelector('#theme-switch'));
    }

    toggleMenu() {
      const menuToggle = this.shadow.querySelector('#menu-toggle');
      const menuContent = this.shadow.querySelector('#menu-content');

      if (this.active) {
        menuToggle.classList.add('active');
        menuContent.classList.add('active');
      } else {
        menuToggle.classList.remove('active');
        menuContent.classList.remove('active');

        // Save settings once the settings page closes
        const newSettings = {
          tileSelection: this.shadow.querySelector('#tile-selection').checked,
          theme: document.body.classList.contains('dark') ? 'dark' : 'light',
        };
        saveSettings(newSettings);
        applySettings();
      }
    }

    updateSettings() {
      const tileSelection = this.shadow.querySelector('#tile-selection');
      tileSelection.setAttribute('checked', this.settings.tileSelection);
    }

    get active() {
      return this.getAttribute('active') === 'true';
    }

    set active(value) {
      this.setAttribute('active', value);
    }

    get settings() {
      // TODO: change for something else
      const settings = this.getAttribute('settings');
      return settings ? JSON.parse(settings) : {};
    }

    connectedCallback() {
      const menuToggle = this.shadow.querySelector('#menu-toggle');

      menuToggle.addEventListener('click', () => {
        this.active = !this.active;
      });

      // Toggle menu on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.active = !this.active;
        }
      });

      this.shadow.querySelector('#theme-switch').addEventListener('click', (event) => {
        const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        setTheme(newTheme, event.target);
      });
    }

    static get observedAttributes() {
      return ['active', 'settings'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'active' &&
        oldValue != null &&
        oldValue !== newValue) { this.toggleMenu(); }
      if (name === 'settings' &&
        (oldValue == null &&
        oldValue !== newValue)) { this.updateSettings(); }
    }
  }

  customElements.define('sliding-menu', SlidingMenu);
};
