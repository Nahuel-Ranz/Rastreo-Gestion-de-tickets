import { checkObjectState, normalizeFormData } from '/js/utils.js';

const form=document.getElementById('page_form');
const modal=document.getElementById('modal_container');

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
        selectStates[key].select.classList.remove('correct');
        selectStates[key].icon.classList.add('hidden');
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if(!checkObjectState(inputStates) || !checkObjectState(selectStates)) {
        alert("Debe corregir los campos obligatorios (son los que tienen asterísco)");
        return;
    }

    const formData = normalizeFormData(form);
    axios.post('/verificar_usuario', formData)
        .then(res => {
            if(!res.data.ok) {
                if(res.data.data[0].credential === 'error') {
                    alert(res.data.data[0].message);
                    return;
                }

                for(const message of res.data.data) {
                    inputStates[message.credential].p.textContent = message.message;
                    inputStates[message.credential].p.classList.remove('hidden');
                    inputStates[message.credential].label.classList.remove('correct');
                    inputStates[message.credential].label.classList.add('error');
                    inputStates[message.credential].input.classList.remove('correct');
                    inputStates[message.credential].input.classList.add('error');
                    inputStates[message.credential].icon.classList.remove('fa-check');
                    inputStates[message.credential].icon.classList.add('fa-times');
                }
            } else {
                modal.classList.remove('hidden');
            }
        })
        .catch(error => console.error(error));
});