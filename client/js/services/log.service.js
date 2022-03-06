// ! Do not console.log in the client - Only console.error when required

function success(message) {
  // TODO: implement
  console.log('SUCCESS:', message);
}

function warn(message) {
  // TODO: implement
  console.warn('WARNING:', message);
}

function error(message) {
  // TODO: implement
  console.error('ERROR:', message);
}

export default {
  success,
  warn,
  error,
};
