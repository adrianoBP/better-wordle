'use strict';
const setTheme = (theme, element) => {
  if (theme == null) { theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }

  document.body.classList.remove('dark');
  document.body.classList.remove('light');
  document.body.classList.add(theme);

  if (element != null) {
    if (theme === 'dark') {
      element.src = '../../resources/icons/sun.svg';
    } else if (theme === 'light') {
      element.src = '../../resources/icons/half-moon.svg';
    }
  }
};

export {
  setTheme,
};
