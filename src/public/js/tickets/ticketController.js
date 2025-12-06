import { radiusToAllTickets } from '/js/tickets/utils.js';

export function ticketHandler(ticketContainer) {
    radiusToAllTickets(ticketContainer.querySelector('#collector_list'));
}