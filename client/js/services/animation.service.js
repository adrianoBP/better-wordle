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

const flip = (element, resultClass) => {
  return new Promise((resolve) => {
    element.classList.add('flip');

    // Remove the flip class to be able to re-flip it again
    element.addEventListener('animationend', () => {
      element.removeEventListener('animationend', () => {});
      element.classList.remove('flip');
      resolve();
    });

    // Animations lasts .5s, half way through the animation, change the color
    setTimeout(() => {
      if (resultClass) {
        element.setAttribute('type', resultClass);
      } else {
        // If we don't pass a resultClass, we want to reset the tile
        element.setAttribute('type', '');
        element.setAttribute('letter', '');
      }
    }, 250);
  });
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
