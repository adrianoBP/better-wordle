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

function flip(element, colorClass, delay = 0) {
  setTimeout(() => {
    element.animate([
      { transform: 'rotateX(-90deg)' },
    ],
    {
      duration: 500,
      direction: 'alternate',
      fill: 'forwards',
    });

    setTimeout(() => {
      element.classList.add(colorClass);
      console.log('flip');
      element.animate([
        { transform: 'rotateX(0deg)' },
      ],
      {
        duration: 500,
        direction: 'alternate',
        fill: 'forwards',
      });
    }, 500);
  }, delay);
}

export default {
  shake,
  flip,
};
