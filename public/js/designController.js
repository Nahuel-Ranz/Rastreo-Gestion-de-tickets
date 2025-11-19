import {
    fillObjectStates,
    fitToScreen,
    radiusToEntireForm
} from '/js/utils.js';

if(!window.inputStates) window.inputStates = {};
if(!window.selectStates) window.selectStates = {};

// individual layouts
const header=document.getElementById('header');
const main=document.getElementById('main');
const footer=document.getElementById('footer');

window.addEventListener('load', () => fitToScreen(header, main, footer));
window.addEventListener('resize', () => fitToScreen(header, main, footer));

// aplicar radius a todos los elementos del formulario.
const form = document.getElementById('page_form');
if(form) { radiusToEntireForm(form); fillObjectStates(form); }