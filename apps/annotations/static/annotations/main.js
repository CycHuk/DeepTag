import { initKonva } from './konva.js';
initKonva();

document.body.addEventListener('htmx:afterRequest', (event) => {
  initKonva()
});