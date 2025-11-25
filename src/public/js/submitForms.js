import {
    checkObjectState,
    createElementAfter,
    hideElement,
    normalizeFormData,
    showElement
} from '/js/utils.js';

export function submitLogin(form) {
    const formData = clearFormData(form);

    axios.post('/login', formData)
        .then(res => {
            if(res.data.credential === 'error') { alert(res.data.message); return; }
            updateInputStates(res.data);
        })
        .catch( error => console.log( error ));
}

export function submitConfirmCode(form) {
    const formData = clearFormData(form);
    console.log(formData);
}

export function submitRegister(form) {
    const formData = clearFormData(form);

    axios.post('/verificar_usuario', formData)
        .then(res => {
            if(!res.data.ok) {
                if(res.data.data[0].credential === 'error') { alert(res.data.data[0].message); return; }
                for(const message of res.data.data) updateInputStates(message);
            } else {
                axios.post('/verificar_correo', { correo: formData.mail })
                    .then(res => {
                        if(!res.data.ok) {
                            if(res.data.error) { alert(res.data.error); return; }
                            else { updateInputStates(res.data); return;}
                        }
                        createElementAfter(form, res.data.modal);
                        import('/js/modal.js')
                            .then( mod => mod.initModal(formData));
                    })
                    .catch(error => console.error(error));
            }
        })
        .catch(error => console.error(error));
}

export function submitReSendCode(mail) {
    axios.post('/re-send_code', { mail })
        .then(res => {
            if(!res.data.ok) { alert(res.data.error); return;}
            else {
                inputStates['code'].input.value = '';
                inputStates['code'].input.classList.remove('correct', 'error');
                inputStates['code'].label.classList.remove('correct', 'error');
                hideElement(inputStates['code'].icon);
                inputStates['code'].errorMessage.textContent = res.data.message;
                inputStates['code'].errorMessage.style.color = 'var(--primary-font-color)';
                showElement(inputStates['code'].errorMessage);
            }
        })
        .catch(error => console.error(error));
}

function updateInputStates(key) {
    inputStates[key.credential].errorMessage.textContent = key.message;
    showElement(inputStates[key.credential].errorMessage);
    inputStates[key.credential].label.classList.remove('correct');
    inputStates[key.credential].label.classList.add('error');
    inputStates[key.credential].input.classList.remove('correct');
    inputStates[key.credential].input.classList.add('error');
    inputStates[key.credential].icon.classList.remove('fa-check');
    inputStates[key.credential].icon.classList.add('fa-times');
}

function clearFormData(form) {
    if(!checkObjectState(inputStates, form) || !checkObjectState(selectStates, form)) {
        alert("Debe corregir los campos obligatorios (son los que tienen asterísco)");
        return;
    }

    return normalizeFormData(form);
}