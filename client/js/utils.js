const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getDateFromMillisec = (millisec) => {
  if (millisec == null) { millisec = Date.now(); }
  return Math.floor(millisec / (1000 * 60 * 60 * 24));
};

const setItem = (key, value) => {
  if (typeof value === 'object') { value = JSON.stringify(value); }

  localStorage.setItem(key, value);
};

const getItem = (key, parse = true) => {
  if (parse) { return JSON.parse(localStorage.getItem(key)); }
  return localStorage.getItem(key);
};

const setTheme = (theme, element) => {
  if (theme == null) { theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }

  document.body.classList.remove('dark');
  document.body.classList.remove('light');
  document.body.classList.add(theme);

  if (element != null) {
    if (theme === 'dark') {
      element.src = '../../resources/icons/half-moon.svg';
    } else if (theme === 'light') {
      element.src = '../../resources/icons/sun.svg';
    }
  }
};

const setUrlParams = (params) => {
  const url = new URL(window.location.href);
  Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));
  window.history.replaceState({}, '', url.href);
};

const deleteUrlParams = (params) => {
  const url = new URL(window.location.href);
  if (params == null || params === []) { url.search = ''; } else {
    params.forEach(param => url.searchParams.delete(param));
  }
  window.history.replaceState({}, '', url.href);
};

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const showElement = (element) => {
  element.classList.remove('hidden');
};

const hideElement = (element) => {
  if (element == null) return;
  if (!element.classList.contains('hidden')) { element.classList.add('hidden'); }
};

const hideElements = (elements) => {
  if (elements == null || elements.length === 0) return;
  elements.forEach(element => hideElement(element));
};

export {
  sleep,
  getDateFromMillisec,
  setItem,
  getItem,
  setTheme,
  isMobile,
  setUrlParams,
  deleteUrlParams,
  showElement,
  hideElement,
  hideElements,
};
