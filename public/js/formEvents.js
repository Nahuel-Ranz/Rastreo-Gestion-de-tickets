import {
	submitConfirmCode,
	submitRegister,
	submitReSendCode
} from '/js/submitForms.js';
import { hideElement } from '/js/utils.js';

export function submitForm(e, form) {
	e.preventDefault();
	
	const btn = e.submitter;
	switch(form.children[0].textContent.toLowerCase()) {
		case "registrarse": submitRegister(form); break;
		case "confirmar la existencia del correo":
			const mail = form.querySelector('strong').textContent;
			switch(btn.id){
				case "re-send_code": submitReSendCode(mail); break;
				case "confirm":
			}
	}
}

export function resetForm() {
	Object.keys(inputStates).forEach(key => {
        inputStates[key].state = false;
        inputStates[key].input.classList.remove('correct', 'error');
        inputStates[key].label.classList.remove('correct', 'error');
		hideElement(inputStates[key].icon);
		hideElement(inputStates[key].errorMessage);
    });

    Object.keys(selectStates).forEach( key => {
        selectStates[key].state = false;
        selectStates[key].label.classList.remove('correct', 'active');
        selectStates[key].select.classList.remove('correct');
		hideElement(selectStates[key].icon);
    });
}