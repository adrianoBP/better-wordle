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
  element.animate([
    { transform: 'rotateX(-90deg)' },
  ],
  {
    duration: 500,
    direction: 'alternate',
    fill: 'forwards',
  });

  await sleep(500);

  element.classList.add(colorClass);
  element.animate([
    { transform: 'rotateX(0deg)' },
  ],
  {
    duration: 500,
    direction: 'alternate',
    fill: 'forwards',
  });
}

export {
  shake,
  flip,
};
