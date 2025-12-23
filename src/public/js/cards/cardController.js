import { radiusToEntireCard } from '/js/cards/utils.js';

export function cardHandler(cards) {
    document.getElementById('main').style.alignItems = 'start';
    radiusToEntireCard(cards);
}