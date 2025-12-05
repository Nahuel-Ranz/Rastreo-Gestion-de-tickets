import { parseRegex, showElement, hideElement } from '/js/utils.js';

export function fillObjectStates(form) {
    const inputs = form.querySelectorAll('input');
    const selects = form.querySelectorAll('select');
    if(inputs) fillInputStates(inputs);
    if(selects) fillSelectStates(selects);
}

function fillInputStates(inputs) {
    inputs.forEach( i => {
        const group = i.parentElement.parentElement;

        inputStates[i.id] = {
            state: false,
            input: i,
            label: group.querySelector('label'),
            icon: group.querySelector('i'),
            errorMessage: group.querySelector('p.message'),
            originalErrorMessage: group.querySelector('p.message').textContent,
            regex: parseRegex(group.querySelector('p.regex').textContent.trim())
        }
    });
}

function fillSelectStates(selects) {
    selects.forEach( s => {
        const group = s.parentElement;

        selectStates[s.id] = {
            state: false,
            select: s,
            label: group.querySelector('label'),
            icon: group.querySelector('i'),
        }

        updateSelectState(selectStates[s.id]);
    });
}

// actualiza el estado en el grupo completo.
export function updateSelectState(o) {
    if (o.select.value) {
        o.label.classList.add('active', 'correct');
        o.select.classList.add('correct');
        showElement(o.icon);
        o.state = true;
    } else {
        o.label.classList.remove('correct', 'active');
        o.select.classList.remove('correct');
        hideElement(o.icon);
        o.state = false;

        // Quita "active" solo si no tiene foco
        if (document.activeElement !== o.select) {
            o.label.classList.remove('active');
        }
    }
}

// actualiza el estado en el grupo completo.
export function updateInputState(o) {
    if(o.input.value==='') {
        o.label.classList.remove('correct', 'error');
        o.input.classList.remove('correct', 'error');
        hideElement(o.icon);
        hideElement(o.errorMessage);
        o.state = false;
        return;
    }

    if(o.regex.test(o.input.value)) {
        o.label.classList.remove('error');
        o.label.classList.add('correct');
        o.input.classList.remove('error');
        o.input.classList.add('correct');
        o.icon.classList.remove('hidden', 'fa-times');
        o.icon.classList.add('fa-check');
        hideElement(o.errorMessage);
        o.state = true;
    } else {
        o.label.classList.remove('correct');
        o.label.classList.add('error');
        o.input.classList.remove('correct');
        o.input.classList.add('error');
        o.icon.classList.remove('hidden', 'fa-check');
        o.icon.classList.add('fa-times');
        o.errorMessage.textContent = o.originalErrorMessage;
        showElement(o.errorMessage);
        o.state = false;
    }
}

export function checkObjectState(object, form) {
    if(!object || Object.keys(object).length === 0) return true;

    const names = Array.from(form.elements)
        .map(e => e.name)
        .filter(name => name);

    const firstItem = Object.values(object)[0];
    const isInputType = firstItem && 'input' in firstItem;

    for (const key in object) {
        if(names.includes(key)) {
            const item = object[key];
            const required = isInputType
            ? item.input.required
            : item.select.required;

            if (required && !item.state) return false;
        }
    }

    return true;
}