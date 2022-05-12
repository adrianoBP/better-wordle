const getDayFromMillisec = (millisec) => {
  if (millisec == null) { millisec = Date.now(); }
  return Math.floor(millisec / (1000 * 60 * 60 * 24));
};

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export {
  getDayFromMillisec,
  sleep,
};
