import { fitToScreen } from './utils.js';

// individual elements
const header=document.getElementById('header');
const main=document.getElementById('main');
const footer=document.getElementById('footer');

window.addEventListener('load', () => fitToScreen(header, main, footer));
window.addEventListener('resize', () => fitToScreen(header, main, footer));