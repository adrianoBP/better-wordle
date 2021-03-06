// Component: toggle element
// Description: Custom toggle element to be used throughout the application
// Attributes:
// - checked (Boolean): defines if the toggle is checked or not

class FancyToggle extends HTMLElement {
  constructor() {
    super();

    this.shadow = this.attachShadow({
      mode: 'closed',
    });
    this.shadow.innerHTML = `
      <style>
        @import url('js/components/toggle/toggle.component.css');
      </style>
      
      <div id="toggle">
        <div id="checkbox"></div>
      </div>
    `;
  }

  get toggleElem() { return this.shadow.querySelector('#toggle'); }

  get checked() { return this.getAttribute('checked') === 'true'; }
  set checked(value) { this.setAttribute('checked', value); }

  get description() {
    return this.getAttribute('description') || '';
  }

  toggle() {
    if (this.checked) {
      this.toggleElem.classList.add('checked');
    } else {
      this.toggleElem.classList.remove('checked');
    }

    // Dispatch callback event
    if (this.toggleCallback) { this.toggleCallback(); }
  }

  connectedCallback() {
    this.toggleElem.addEventListener('mouseup', () => {
      this.checked = !this.checked;
    });

    this.toggleElem.setAttribute('title', this.description);

    this.toggle();
  }

  static get observedAttributes() {
    return ['checked'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'checked' &&
        oldValue != null &&
        oldValue !== newValue) { this.toggle(); }
  }
}

customElements.define('fancy-toggle', FancyToggle);
