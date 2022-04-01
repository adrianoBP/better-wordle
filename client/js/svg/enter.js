const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('viewBox', '0 0 24 24');

const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
path1.setAttribute('d', 'M3 14a1 1 0 0 1 1-1h12a3 3 0 0 0 3-3V6a1 1 0 1 1 2 0v4a5 5 0 0 1-5 5H4a1 1 0 0 1-1-1z');

const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
path2.setAttribute('d', 'M3.293 14.707a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 1.414L5.414 14l3.293 3.293a1 1 0 1 1-1.414 1.414l-4-4z');

svg.appendChild(path1);
svg.appendChild(path2);


export { svg };
