'use strict';

import { setTheme } from '../../services/common.service.js';
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

    onActiveChange() {
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
          theme: document.body.classList.contains('dark') ? 'dark' : 'light',
        };
        saveSettings(newSettings);
        applySettings();
      }
    }

    onSettingsChange() {
      this.shadow.querySelector('#tile-selection')
        .setAttribute('checked', this.settings.tileSelection);
      this.shadow.querySelector('#validate-word')
        .setAttribute('checked', this.settings.validateOnComplete);
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
        oldValue !== newValue) { this.onActiveChange(); }
      if (name === 'settings' &&
        (oldValue == null &&
        oldValue !== newValue)) { this.onSettingsChange(); }
    }
  }

  customElements.define('sliding-menu', SlidingMenu);
};
