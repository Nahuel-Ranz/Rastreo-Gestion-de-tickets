import {
    closeDropdowns,
    closeDropdownsExcept,
    hideElement,
    hp,
    radiusToAll
} from '/js/utils.js';

export function components() {
    radiusToAll(document.getElementsByTagName('button'));
    animateParagraph(document.querySelectorAll('.animated_paragraph'));

    document.addEventListener('click', closeDropdowns);
    dropdowns(document.querySelectorAll('.dropdown'));

    flatpickrBirthdates(document.querySelectorAll('.pickr-container.birthdate'));
    flatpickrEventDates(document.querySelectorAll('.pickr-container.event_date'));

    //document.getElementById('logout').addEventListener('click', logout);
}

export function resizingComponents() {
    animateParagraph(document.querySelectorAll('.animated_paragraph'));
}

function animateParagraph(paragraphs) {
    paragraphs.forEach( p => {
        const span = p.querySelector('span');

        const contentWidth = p.clientWidth - hp(p);
        const textWidth = span.scrollWidth;

        const move = Math.max(0, textWidth - contentWidth);
        span.style.setProperty('--move', `${move}px`);
    });
}

function dropdowns(dropdowns) {

    dropdowns.forEach(dropdown => {
        const btn = dropdown.firstElementChild;
        const list = dropdown.querySelector('.dropdownList');

        radiusToAll(list.getElementsByTagName('li'), 10);
        hideElement(list);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            closeDropdownsExcept(list);
            list.classList.toggle('hidden');
        });
    });
}

function flatpickrBirthdates(containers) {
    containers.forEach(birthdate => {
        const group = birthdate.firstElementChild;
        const input = group.querySelector('input');

        flatpickr(input, {
            dateFormat: 'Y-m-d',
            maxDate: new Date().fp_incr((-18*365)-5),
            altFormat: 'd-m-Y',
            allowInput: false,
            clickOpens: true,
            disableMobile: true,
            onReady: function(selectedDates, dateStr, instance) {
                const pickr = instance.calendarContainer;
                if (!pickr) return;
                
                const groupWidth = window.getComputedStyle(group).width;
                pickr.style.width = groupWidth;
            },
            onOpen: function(selectedDates, dateStr, instance) {
                if (!group) return;
                instance.calendarContainer.style.width = window.getComputedStyle(group).width;
            }
        });
    });
}

function flatpickrEventDates(containers) {
    containers.forEach(event => {
        const input = event.querySelector('input');
        
        flatpickr(input, {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            minDate: new Date().fp_incr(7),
            minuteIncrement: 10,
            time_24hr: true,
            disable:[
                function(date){
                    return ([0, 6].includes(date.getDay()));
                }
            ]
        });
    });
}