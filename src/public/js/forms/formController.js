import { fillObjectStates, updateSelectState, updateInputState, } from '/js/forms/stateController.js';
import { focusedSelect, resetForm, settingPassword, submitForm } from '/js/forms/formEvents.js';
import { radiusToEntireForm } from '/js/forms/utils.js';

export function formHandler(form) {
    if(!window.inputStates) window.inputStates = {};
    if(!window.selectStates) window.selectStates = {};

    fillObjectStates(form);
    radiusToEntireForm(form);
    addingEvents(form);
}

function addingEvents(form) {
    form.addEventListener('submit', (e) => submitForm(e, form));
    form.addEventListener('reset', () => resetForm());

    // selects
    form.addEventListener('focusin', (e) => {
        if(e.target.matches('select')) focusedSelect(e.target);
    });
    form.addEventListener('focusout', (e) => {
        if(e.target.matches('select')) updateSelectState(selectStates[e.target.id]);
    });
    form.addEventListener('change', (e) => {
        if(e.target.matches('select')) updateSelectState(selectStates[e.target.id]);
    });

    //inputs
    form.addEventListener('input', (e) => {
        if(e.target.matches('input')) {
            updateInputState(inputStates[e.target.id]);
            if(e.target.id === 'password') settingPassword(e.target);
        }
    });
}