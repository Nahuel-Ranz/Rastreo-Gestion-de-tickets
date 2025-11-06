const { mysql, getMongo } = require('./connections.js');
const argon2 = require('argon2');
const UAParser = require('ua-parser-js');
// ===========================================================================================================================
async function getAreas() {
    try {
        const [areas] = await mysql.query(`call obtenerAreas();`);

        return { data: areas[0] };
    } catch (error) {
        console.error('Error al intentar obtener las áreas (desde spQueries): ', error);
        return { data: [{value:'', content:'Error desde spQueries'}] };
    }
}
// ===========================================================================================================================
async function checkNewUser(dni, celular, correo) {
    try {

        // [{ credencial, message }, ... ]
        const [alreadyExists] = await mysql.query('call verificarNuevoUsuario(?,?,?)',
            [dni, celular, correo]
        );

        return { data: alreadyExists[0] };
    } catch (error) {
        console.error('No se pudo chequear el usuario (desde spQueries): ', error);
        return { data: [{credencial:'', message:'Error en la verificación desde spQueries'}] };
    }
}
// ===========================================================================================================================
async function registerUser(nombre, apellido, dni, fechaNacimiento, celular, correo, areaFacultad, contrasenia) {
    try {
        const hash = await argon2.hash(contrasenia, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 4,
            parallelism: 1
        });

        await mysql.execute('call registrarUsuario(?,?,?,?,?,?,?,?,?)', [
            nombre, apellido, dni, fechaNacimiento, new Date(), celular, correo, areaFacultad, hash
        ]);

        return { ok:true };
    } catch (error) {
        console.error('No se pudo registrar el usuario (desde spQueries): ', error);
        return { error: 'Error desde spQueries.' };
    }
}
// ===========================================================================================================================
async function aproveNewUser(id, rol) {
    try {
        await mysql.execute('call aprobarRegistro(?,?)', [ id, rol ]);
        return { ok:true };
    } catch (error) {
        console.error('Error al aprobar el usuario (desde spQueries): ', error);
        return { error: 'El usuario no ha sido aprobado.' };
    }
}
// ===========================================================================================================================
async function getArgon2Hash(credential) {
    try {
        const [result] = await mysql.query('call obtenerArgon2Hash(?);', [ JSON.stringify([credential]) ]);
        const response = Array.isArray(result[0]) ? result[0][0] : result[0];

        if(response.ok) return { ok: true, id:response.id_user, hash:response.hash };
        return { ok: false, error:response.error };
    } catch (error) {
        console.error('Error al obtener el Hash de Argon2 (desde spQueries): ', error);
        return { ok: false, error: 'Error al obtener Argon2 (desde spQueries).' };
    }
}
// ===========================================================================================================================
async function initSession(req, id_user) {
    try {
        const parser = new UAParser(req.headers['user-agent']);
        const ua = parser.getResult();

        const device = ua.device.type || 'PC';
        const os = ua.os.name || 'Desconocido';
        const browser = ua.browser.name || 'Desconocido';
        const ip = req.ip.replace('::ffff:', '') || '0.0.0.0';
        const date = new Date();

        const [result] = await mysql.query('call iniciarSesion(?,?,?,?,?,?,?);', [
            id_user, device, ip, os, browser, date, date
        ]);

        const response = Array.isArray(result[0]) ? result[0][0] : result[0];
        return response.ok
            ? { ok: true, data: JSON.parse(response.datos_sesion) }
            : { ok: false, error: response.error };
    } catch (error) {
        console.error('Error al iniciar sesión (desde spQueries): ', error);
        return { ok: false, error: 'No se ha podido iniciar sesión ni recibir las credenciales.' };
    }
}
// ===========================================================================================================================
async function updateLastActivity(session_id) {
    try {
        await mysql.execute('call actualizarUltimaActividad(?, ?)', [ session_id, new Date() ]);
        return { ok: true };
    } catch (error) {
        console.error('Error al actualizar la última actividad (desde spQueries): ', error);
        return { ok: false, error: 'No se pudo actualizar la última actividad.' };
    }
}
// ===========================================================================================================================
async function closeSession(session_id) {
    try {
        await mysql.execute('call cerrarSesion(?, ?)', [ session_id, new Date() ]);
        return { ok: true };
    } catch (error) {
        console.error('Error al cerrar la última actividad (desde spQueries): ', error);
        return { ok: false, error: 'No se pudo cerrar la última actividad.' };
    }
}
// ===========================================================================================================================
async function rejectNewUser(id) {
    try {
        await mysql.execute('call rechazarRegistro(?)', [ id ]);
        return { ok: true };
    } catch (error) {
        console.error('Error al rechazar el nuevo usuario (desde spQueries): ', error);
        return { ok: false, error: 'No se pudo rechazar el nuevo usuario.' };
    }
}
// ===========================================================================================================================
async function getUserData(id) {
    try {
        const [result] = await mysql.query('call obtenerDatosUsuario(?)', [ id ]);
        const user = result[0]?.[0] || null;

        if(!user) return { ok: false, error:'Usuario no encontrado.' };

        if (typeof user.celulares === 'string') user.celulares = JSON.parse(user.celulares);
        if (typeof user.correos === 'string') user.correos = JSON.parse(user.correos);
        if (typeof user.areas_facultad === 'string') user.areas_facultad = JSON.parse(user.areas_facultad);
        if (typeof user.permisos === 'string') user.permisos = JSON.parse(user.permisos);

        return { ok:true, data:user };
    } catch (error) {
        console.error('Error al objeter los datos del usuario (desde spQueries): ', error);
        return { ok: false, error: 'No se pudo obtener los datos del usuario.' };
    }
}
// ===========================================================================================================================
async function createTicket(solicitante_id, area_facultad_id, fecha_actividad) {
    try {
        const [result] = await mysql.query('call crearTicket(?,?,?,?)', [
            new Date(), solicitante_id, area_facultad_id, fecha_actividad
        ]);
        const ticketId = result[0]?.[0]?.ticketId || null;

        return { ok: true, data: ticketId };
    } catch (error) {
        console.error('No se puedo crear el ticket (desde spQueries): ', error);
        return { ok: false, error: 'No se pudo crear el ticket.' };
    }
}
// ===========================================================================================================================
async function acceptTicket(id, fecha, solicitante_id, area_id, fecha_actividad) {
    try {
        await mysql.execute('call aceptarTicket(?,?,?,?,?)', [
            id, fecha, solicitante_id, area_id, fecha_actividad
        ]);

        return { ok: true };
    } catch (error) {
        console.error(`Error al aceptar el ticket ${ id } (desde spQueries): `, error);
        return { ok: false, error: `No se pudo aceptar el ticket ${ id }.` };
    }
}
// ===========================================================================================================================
async function changeTicketStatus(id, abreviation_status) {
    try {
        await mysql.execute('call cambiarEstadoTicket(?,?)', [ id, abreviation_status ]);

        return { ok: true };
    } catch (error) {
        console.error(`Error al cambiar el estado del ticket ${ id } (desde spQueries): `, error);
        return { ok: false, error: `No se pudo cambier el estado del ticket ${ id }.` };
    }
}
// ===========================================================================================================================
// type: 'Aprobados' || ''
async function getTickets(usuario_id, page=1, type='Aprobados') {

    if (!['Aprobados',''].includes(type)) {
        return { ok:false, error:'Tipo de tickets inválido.' };
    }

    try {
        const [result] = await mysql.query(`call obtenerTickets(?,?,?)`, [ usuario_id, page, type ]);

        const tickets_propios = result[0]?.[0]?.tickets_propios
            ? JSON.parse(result[0][0].tickets_propios)
            : [];

        const tickets_ajenos = result[1]?.[0]?.tickets_ajenos
            ? JSON.parse(result[1][0].tickets_ajenos)
            : [];
        
        return { ok: true, tickets_propios, tickets_ajenos };
    } catch( error ) {
        console.error(`Error al intentar obtener los tickets ${type}: ${ error }`);
        return { ok: false, error:`No se pudo obtener los tickets ${type}.`}
    }
}
// ===========================================================================================================================
async function sendMessage(emisor_id, receptor_id, message, ticket_id ) {
    try {
        const [result] = await mysql.execute('call enviarMensaje(?,?,?,?,?)', [
            emisor_id, receptor_id, message, new Date(), ticket_id
        ]);

        const message_id = result[0][0]['last_insert_id()'];

        return { ok: true, message_id };
    } catch (error) {
        console.error(`Error al enviar mensaje (desde spQueries): `, error);
        return { ok: false, error: `No se pudo enviar el mensaje del ticket ${ticket_id}.` };
    }
}
// ===========================================================================================================================
async function receiveMessages(id) {
    try {
        await mysql.execute('call recibirMensajes(?)', [ id ]);

        return { ok: true };
    } catch (error) {
        console.error(`Error al recibir los mensajes (desde spQueries): `, error);
        return { ok: false, error: `No se pudo recibir los mensajes.` };
    }
}
// ===========================================================================================================================
async function getMessages(me_id, other_id, ticket_id, page=1) {
	try {
		const [result] = await mysql.query('call obtenerMensajes(?,?,?,?)', [
			me_id, other_id, ticket_id, page
		]);
		const messages = result[0] || [];
		
		return { ok: true, data: messages };
	} catch (error) {
		console.error('Error al intentar obtener los mensajes (desde spQueries): ', error);
		return { ok: false, error: 'No se pudieron obtener los mensajes.' };
	}
}
// ===========================================================================================================================
async function readMessages(messages_id = []) {
    try {
        await mysql.execute('call leerMensajes(?);', [ JSON.stringify(messages_id) ]);

        return { ok: true };
    } catch ( error ) {
        console.error('Error al obtener los mensajes (desde spQueries): ', error);
        return { ok: false, error:'No se pudo obtener los mensajes.' };
    }
}
// ===========================================================================================================================
async function updateTicket(id, fecha_actividad = null, origin_id = null) {
    try {
        await mysql.execute('call actualizarTicket(?,?,?,?);', [
            id, new Date(), fecha_actividad, origin_id
        ]);

        return { ok: true };
    } catch ( error ) {
        console.error('Error al actualizar el ticket (desde spQueries): ', error);
        return { ok: false, error:'No se pudo actualizar el ticket.' };
    }
}
// ===========================================================================================================================
async function userExists(credencial = []) {
	try {
		const [result] = await mysql.query('call existeUsuario(?)', [
			JSON.stringify(credencial)
		]);
		const confirmation = result[0][0];
		
		return { ok: true, data: confirmation };
	} catch (error) {
		console.error('Error al intentar verificar la existencia del usuario (desde spQueries): ', error);
		return { ok: false, error: 'No se pudieron verificar si el usuario existe.' };
	}
}
// ===========================================================================================================================
// ===========================================================================================================================
// ===========================================================================================================================
// ===========================================================================================================================
module.exports = {
    acceptTicket,
    aproveNewUser,
    changeTicketStatus,
    checkNewUser,
    closeSession,
    createTicket,
    getAreas,
    getArgon2Hash,
    getMessages,
    getTickets,
    getUserData,
    initSession,
    readMessages,
    receiveMessages,
    registerUser,
    rejectNewUser,
    sendMessage,
    updateLastActivity,
    updateTicket,
    userExists
}