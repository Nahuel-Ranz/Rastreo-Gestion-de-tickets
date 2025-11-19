import { submitForm, resetForm } from '/js/formEvents.js';

const form=document.getElementById('page_form');
if(form) form.addEventListener('submit', (e) => submitForm(e, form));
if(form) form.addEventListener('reset', () => resetForm());