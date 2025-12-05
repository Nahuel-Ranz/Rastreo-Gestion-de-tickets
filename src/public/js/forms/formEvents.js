import {
	submitConfirmCode,
	submitLogin,
	submitRegister,
	submitReSendCode,
	submitSaveDataForm,
	submitSetPassword
} from '/js/forms/submitForms.js';

import { updateInputState } from '/js/forms/stateController.js';
import { escapeRegex, hideElement } from '/js/utils.js';

export function submitForm(e, form) {
	e.preventDefault();
	
	const btn = e.submitter;
	switch(form.children[0].textContent.toLowerCase()) {
		case "iniciar sesión": submitLogin(form); break;
		case "registrarse": submitRegister(form); break;
		case "confirmar la existencia del correo":
			const mail = form.querySelector('strong').textContent;
			switch(btn.id){
				case "re-send_code": submitReSendCode(mail); break;
				case "confirm":
					(async () => {
						const result = await submitConfirmCode(form);
						if(result) {
							const main = form.closest('#main');
							const mainForm = main.firstElementChild;
							submitSaveDataForm(mainForm);
						}
					})();
				break;
			}
		break;
		case "establecer contraseña": submitSetPassword(form); break;
		case "esperando confirmación" : window.location.replace('/'); break;
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

export function focusedSelect(e) {
	const group = e.parentElement;
	group.querySelector('label').classList.add('active');
}

export function settingPassword(input) {
	const safeRegex = escapeRegex(input.value);

	inputStates['re-password'].regex = new RegExp(`^${safeRegex}$`);
	updateInputState(inputStates['re-password']);

	inputStates['token'].state = true;
}