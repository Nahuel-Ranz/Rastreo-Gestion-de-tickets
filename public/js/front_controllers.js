import { radius, fitToScreen } from './utils.js';

// individual elements
const header=document.getElementById('header');
const main=document.getElementById('main');
const footer=document.getElementById('footer');

// collection elements
const elements=document.getElementsByName('radius');


window.addEventListener('load', () => fitToScreen(header, main, footer));
window.addEventListener('resize', () => fitToScreen(header, main, footer));


elements.forEach(e => radius(e));