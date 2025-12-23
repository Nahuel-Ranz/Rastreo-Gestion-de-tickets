import { fitToScreen } from '/js/utils.js';
import { formHandler } from '/js/forms/formController.js';
import { initSocket } from '/js/socket/socketController.js'
import { ticketHandler } from '/js/tickets/ticketController.js';
import { cardHandler } from '/js/cards/cardController.js';
import { components, resizingComponents } from '/js/components.js';

// individual layouts
const header=document.getElementById('header');
const main=document.getElementById('main');
const footer=document.getElementById('footer');

window.addEventListener('load', () => {
    fitToScreen(header, main, footer);
    initSocket();
    components();
});
window.addEventListener('resize', () => {
    fitToScreen(header, main, footer);
    resizingComponents();
});

// Control del formulario.
const form = main.querySelector('#page_form');
if(form) formHandler(form);

// Control de los tickets.
const ticketContainer = main.querySelector('#ticket_collector');
if(ticketContainer) ticketHandler(ticketContainer);

// Control de las cards.
const cards = main.querySelectorAll('.card-container');
if(cards.length > 0) cardHandler(cards);