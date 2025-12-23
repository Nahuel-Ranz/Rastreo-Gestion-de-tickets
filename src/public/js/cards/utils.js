import { radius, radiusToAll } from '/js/utils.js';

export function radiusToEntireCard(cards) {

    radiusToAll(cards);
    cards.forEach( card => {
        radius(card.querySelector('header'));
        radius(card.querySelector('main'));
    });
}