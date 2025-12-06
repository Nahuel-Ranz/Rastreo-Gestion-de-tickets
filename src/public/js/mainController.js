import { fitToScreen } from '/js/utils.js';
import { formHandler } from '/js/forms/formController.js';
import { initSocket } from '/js/socket/socketController.js'
import { ticketHandler } from '/js/tickets/ticketController.js';
import { components } from '/js/components.js';

// individual layouts
const header=document.getElementById('header');
const main=document.getElementById('main');
const footer=document.getElementById('footer');

window.addEventListener('load', () => {
    fitToScreen(header, main, footer);
    initSocket();
});
window.addEventListener('resize', () => fitToScreen(header, main, footer));

// Control del formulario.
const form = main.querySelector('#page_form');
if(form) formHandler(form);

// Control de los tickets.
const ticketContainer = main.querySelector('#ticket_collector');
if(ticketContainer) ticketHandler(ticketContainer);

components();