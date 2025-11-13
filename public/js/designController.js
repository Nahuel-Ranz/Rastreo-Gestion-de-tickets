import { adjustModal, fitToScreen, radius, radiusToAll } from './utils.js';

// individual layouts
const header=document.getElementById('header');
const main=document.getElementById('main');
const footer=document.getElementById('footer');
const modal=document.getElementById('modal');
const modalHeader=document.getElementById('modal_header');
const modalBody=document.getElementById('modal_body');
const modalFooter=document.getElementById('modal_footer');

// elements collections
const form = document.getElementById('page_form');
const labels = document.getElementsByTagName('label');
const inputs = document.getElementsByTagName('input');
const selects = document.getElementsByTagName('select');

window.addEventListener('load', () => {
    fitToScreen(header, main, footer);
    if(modal) adjustModal(modal, modalHeader, modalBody, modalFooter);
});

window.addEventListener('resize', () => {
    fitToScreen(header, main, footer);
    if(modal) adjustModal(modal, modalHeader, modalBody, modalFooter);
});

if(labels) radiusToAll(labels);
if(inputs) radiusToAll(inputs);
if(selects) radiusToAll(selects);
if(form) radius(form, 20);
if(modal) radius(modal,8);