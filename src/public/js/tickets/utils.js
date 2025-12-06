import { radius, radiusToAll } from '/js/utils.js';

export function radiusToAllTickets(list) {
    const tickets = list.querySelectorAll('.ticket_container');

    radius(list, 30);
    radiusToAll(tickets, 20);
}