'use strict';
import { sleep } from './common.service.js';

const shake = (element) => {
  element.animate([
    { transform: 'translateX(-0.1em)' },
    { transform: 'translateX(0.1em)' },
    { transform: 'translateX(0)' },
  ],
  {
    duration: 200,
    iterations: 2,
  });
};

const flip = async (element, resultClass) => {
  element.classList.add('flip');
  // Animations lasts .5s, half way through the animation, change the color
  await sleep(250);
  if (resultClass) {
    element.classList.add(resultClass);
  }
};

const flipWithDelay = async (element, resultClass, delay) => {
  await sleep(delay);
  flip(element, resultClass);
};

export {
  shake,
  flip,
  flipWithDelay,
};
