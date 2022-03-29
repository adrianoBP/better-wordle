import { sleep } from './common.service.js';

function shake(element) {
  // TODO: why not https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/animationend_event

  element.animate([
    // TODO: validate all CSS to start with 0._ instead of ._
    { transform: 'translateX(-0.1em)' },
    { transform: 'translateX(0.1em)' },
    { transform: 'translateX(0)' },
  ],
  {
    duration: 200,
    iterations: 2,
  });
}

async function flip(element, resultClass) {
  element.classList.add('flip');
  // Animations lasts .5s, half way through the animation, change the color
  await sleep(250);
  if (resultClass) { element.classList.add(resultClass); }
}

async function flipWithDelay(element, resultClass, delay) {
  await sleep(delay);
  flip(element, resultClass);
}

export {
  shake,
  flip,
  flipWithDelay,
};
