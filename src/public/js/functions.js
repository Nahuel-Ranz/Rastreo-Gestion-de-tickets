export async function logout() {
	try {
		const res = await axios('/logout', {method:'POST'});
		if(res.ok) window.location.replace(res.redirect);
	} catch (error) {
		console.error(`Ha ocurrido un error al intentar cerrar la sesión: ${error}`);
		alert(`No se ha podido cerrar la sesión: ${error}`);
	}
}