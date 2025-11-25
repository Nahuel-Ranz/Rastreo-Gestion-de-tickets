import { initSocketHandlers } from '/js/socket/socketHandler.js'
import { fitToScreen, formHandler } from '/js/utils.js';

// individual layouts
const header=document.getElementById('header');
const main=document.getElementById('main');
const footer=document.getElementById('footer');

window.addEventListener('load', () => {
    fitToScreen(header, main, footer);
    initSocketHandlers();
});
window.addEventListener('resize', () => fitToScreen(header, main, footer));

// Control del formulario.
const form = document.getElementById('page_form');
if(form) formHandler(form);