import { sleep } from './common.service.js';

function shake(element) {
  element.animate([
    { transform: 'translateX(-.1em)' },
    { transform: 'translateX(.1em)' },
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
