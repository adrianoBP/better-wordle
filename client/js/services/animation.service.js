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

async function flip(element, colorClass) {
  element.classList.add('flip');
  // Animations lasts .5s, half way through the animation, change the color
  await sleep(250);
  if (colorClass) { element.classList.add(colorClass); }
}

export {
  shake,
  flip,
};
