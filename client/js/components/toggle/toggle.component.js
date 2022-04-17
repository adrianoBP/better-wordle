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

  get checked() {
    return this.getAttribute('checked') === 'true';
  }

  set checked(value) {
    this.setAttribute('checked', value);
  }

  toggle() {
    const toggle = this.shadow.querySelector('#toggle');

    if (this.checked) {
      toggle.classList.add('checked');
    } else {
      toggle.classList.remove('checked');
    }
  }

  connectedCallback() {
    const toggle = this.shadow.querySelector('#toggle');
    toggle.addEventListener('mouseup', () => {
      this.checked = !this.checked;
    });

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
