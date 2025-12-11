import { createElementAfter, showElement } from '/js/utils.js';
import { getSocket } from '/js/socket/socket.js';

export function initSocket() {
    const socket = getSocket();
	
	socketListeners(socket);
	socketEmit(socket);
}

function socketListeners(socket) {
    socket.on("code_expired", ({mail}) => {
        inputStates['code'].input.value = '';
        inputStates['code'].input.classList.remove('correct');
        inputStates['code'].input.classList.add('error');
        inputStates['code'].label.classList.remove('correct');
        inputStates['code'].label.classList.add('error');
        inputStates['code'].icon.classList.remove('fa-check');
        inputStates['code'].icon.classList.add('fa-times');
        showElement(inputStates['code'].icon);
        inputStates['code'].errorMessage.textContent = `El código enviado a ${mail} ha expirado.`;
        inputStates['code'].errorMessage.style.color = 'var(--error-font-color)';
        showElement(inputStates['code'].errorMessage);
    });
	
	socket.on("session_expired", () => window.location.href = '/login');
	socket.on('force_logout', (modal) => {
		createElementAfter(document.getElementById('main'), modal);
		import('/js/modal.js')
			.then( mod => mod.initModal());
	});
    socket.on('refresh_cookie', () => axios.get('/ping').catch(()=>{}));
    socket.on("chat_message", data => { });
    socket.on("notification", data => { });
}

function socketEmit(socket) { }