import { fitToScreen, radiusToAll } from './utils.js';

// individual layouts
const header=document.getElementById('header');
const main=document.getElementById('main');
const footer=document.getElementById('footer');

// elements collections
const labels = document.getElementsByTagName('label');
const inputs = document.getElementsByTagName('input');


window.addEventListener('load', () => fitToScreen(header, main, footer));
window.addEventListener('resize', () => fitToScreen(header, main, footer));

radiusToAll(labels);
radiusToAll(inputs);