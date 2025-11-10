import { fitToScreen, radius, radiusToAll } from './utils.js';

// individual layouts
const header=document.getElementById('header');
const main=document.getElementById('main');
const footer=document.getElementById('footer');

// elements collections
const form = document.getElementById('page_form');
const labels = document.getElementsByTagName('label');
const inputs = document.getElementsByTagName('input');
const modal_body = document.getElementById('modal-body');

window.addEventListener('load', () => fitToScreen(header, main, footer));
window.addEventListener('resize', () => fitToScreen(header, main, footer));

radiusToAll(labels);
radiusToAll(inputs);
radius(modal_body, 15);
radius(form, 20);