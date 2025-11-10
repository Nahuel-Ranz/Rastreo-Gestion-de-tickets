import { checkObjectState } from '/js/utils.js';

const form=document.getElementById('page_form');

form.addEventListener('reset', () => {

    Object.keys(inputStates).forEach(key => {
        inputStates[key].state = false;
        inputStates[key].input.classList.remove('correct', 'error');
        inputStates[key].label.classList.remove('correct', 'error');
        inputStates[key].icon.classList.add('hidden');
        inputStates[key].p.classList.add('hidden');
    });

    Object.keys(selectStates).forEach( key => {
        selectStates[key].state = false;
        selectStates[key].label.classList.remove('correct', 'active');
        selectStates[key].choices__inner.classList.remove('correct');
        selectStates[key].choices.setChoiceByValue('');
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if(!checkObjectState(inputStates) || !checkObjectState(selectStates)) {
        alert("Debe corregir los campos obligatorios (son los que tienen asterísco)");
        return;
    }

        const formData = new FormData(form);
        const entries = Object.fromEntries(formData.entries());

        console.log('Datos del formulario:', entries);
});