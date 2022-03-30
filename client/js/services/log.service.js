'use strict';
// ! Do not console.log in the client - Only console.error when required

const success = (message) => {
  // TODO: implement
  console.log('SUCCESS:', message);
};

const warn = (message) => {
  // TODO: implement
  console.warn('WARNING:', message);
};

const error = (message) => {
  // TODO: implement
  console.error('ERROR:', message);
};

export {
  success,
  warn,
  error,
};
