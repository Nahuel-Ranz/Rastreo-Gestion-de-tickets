import { showElement } from '/js/utils.js';
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
	
    socket.on("chat_message", data => {

    });

    socket.on("notification", data => {

    });
}

function socketEmit(socket) {
	if(__IS_AUTH__)	{
		const sid = getCookie('sid');
		if(sid) socket.emit('bind_session', {sid});
	}
}

function getCookie(name) {
	return document.cookie
		.split('; ')
		.find(row => row.startsWith(`${name}=`))
		?.split('=')[1];
}