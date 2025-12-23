const { mysql, getMongo, getRedis } = require('./connections.js');
const argon2 = require('argon2');
const UAParser = require('ua-parser-js');
const utils = require('../utils/utils.js');
// ===========================================================================================================================
async function aproveNewUser(id, rol) {
    try {
        await mysql.execute('call aprobarRegistro(?,?)', [ id, rol ]);
        return { ok:true };
    } catch (error) {
        console.error('Error al aprobar el usuario (desde dbQueries): ', error);
        return { ok: false, error: 'El usuario no ha sido aprobado (desde dbQueries).' };
    }
}
// ===========================================================================================================================
async function updateLastActivity(sid) {
    try {
        await mysql.execute('call actualizarUltimaActividad(?, ?)', [ sid, new Date() ]);
        return { ok: true };
    } catch (error) {
        console.error('Error al actualizar la última actividad (desde dbQueries): ', error);
        return { ok: false, error: 'No se pudo actualizar la última actividad (desde dbQueries).' };
    }
}
// ===========================================================================================================================
async function closeSession(sid) {
    try {
        await mysql.execute('call cerrarSesion(?, ?)', [ sid, new Date() ]);
        return { ok: true };
    } catch (error) {
        console.error('Error al cerrar la última actividad (desde dbQueries): ', error);
        return { ok: false, error: 'No se pudo cerrar la última sesión activa (desde dbQueries).' };
    }
}
// ===========================================================================================================================
async function rejectNewUser(id) {
    try {
        await mysql.execute('call rechazarRegistro(?)', [ id ]);
        return { ok: true };
    } catch (error) {
        console.error('Error al rechazar el nuevo usuario (desde dbQueries): ', error);
        return { ok: false, error: 'No se pudo rechazar el nuevo usuario (desde dbQueries).' };
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

        const [result] = await mysql.query('call registrarUsuario(?,?,?,?,?,?,?,?,?)', [
            nombre, apellido, dni, fechaNacimiento, new Date(), celular, correo, areaFacultad, hash
        ]);

        return { ok:true, userId: result[0][0]['userId'] };
    } catch (error) {
        console.error('No se pudo registrar el usuario (desde dbQueries): ', error);
        return { ok:false, error: 'Error al registrar el usuario (desde dbQueries).' };
    }
}
// ===========================================================================================================================
async function sendMessage(emisor_id, receptor_id, message, ticket_id ) {
    try {
        const [result] = await mysql.query('call enviarMensaje(?,?,?,?,?)', [
            emisor_id, receptor_id, message, new Date(), ticket_id
        ]);

        return { ok: true, messageId: result[0][0]['messageId'] };
    } catch (error) {
        console.error(`Error al enviar mensaje (desde dbQueries): `, error);
        return { ok: false, error: `No se pudo enviar el mensaje del ticket ${ticket_id} (desde dbQueries).` };
    }
}
// ===========================================================================================================================
async function receiveMessages(id) {
    try {
        await mysql.execute('call recibirMensajes(?)', [ id ]);

        return { ok: true };
    } catch (error) {
        console.error(`Error al recibir los mensajes (desde dbQueries): `, error);
        return { ok: false, error: `No se pudo recibir los mensajes (desde dbQueries).` };
    }
}
// ===========================================================================================================================
async function readMessages(messages_id = []) {
    try {
        await mysql.execute('call leerMensajes(?);', [ JSON.stringify(messages_id) ]);

        return { ok: true };
    } catch ( error ) {
        console.error('Error al obtener los mensajes (desde dbQueries): ', error);
        return { ok: false, error:'No se pudo obtener los mensajes (desde dbQueries).' };
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
        console.error('Error al actualizar el ticket (desde dbQueries): ', error);
        return { ok: false, error:'No se pudo actualizar el ticket (desde dbQueries).' };
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
        console.error(`Error al aceptar el ticket ${ id } (desde dbQueries): `, error);
        return { ok: false, error: `No se pudo aceptar el ticket ${ id } (desde dbQueries).` };
    }
}
// ===========================================================================================================================
async function changeTicketStatus(id, abreviation_status) {
    try {
        await mysql.execute('call cambiarEstadoTicket(?,?)', [ id, abreviation_status ]);

        return { ok: true };
    } catch (error) {
        console.error(`Error al cambiar el estado del ticket ${ id } (desde dbQueries): `, error);
        return { ok: false, error: `No se pudo cambier el estado del ticket ${ id } (desde dbQueries).` };
    }
}
// ===========================================================================================================================
async function getAreas() {
    try {
        const [areas] = await mysql.query(`call obtenerAreas();`);

        return { ok: true, data: areas[0] };
    } catch (error) {
        console.error('Error al intentar obtener las áreas (desde dbQueries): ', error);
        return { ok: false, data: [{value:'', content:'Error desde dbQueries'}] };
    }
}
// ===========================================================================================================================
async function checkNewUser(dni, celular, correo) {
    try {

        // [{ credencial, message }, ... ]
        const [alreadyExists] = await mysql.query('call verificarNuevoUsuario(?,?,?)',
            [dni, celular, correo]
        );

        if(alreadyExists[0].length === 0) return { ok:true };
        return { ok:false, data: alreadyExists[0] };
    } catch (error) {
        console.error('No se pudo chequear el usuario (desde dbQueries): ', error);
        return { ok:false, data: [{credential:'error', message:'Error en la verificación (desde dbQueries)'}] };
    }
}
// ===========================================================================================================================
async function getArgon2Hash(credential) {
    try {
        const [result] = await mysql.query('call obtenerArgon2Hash(?);', [ JSON.stringify([credential]) ]);
        const response = result[0][0];
		
        if(response.ok) return { ok: true, id:response.id_user, hash:response.hash };
        return { ok: false, credential: 'credential', message:response.error };
    } catch (error) {
        console.error('Error al obtener el Hash de Argon2 (desde dbQueries): ', error);
        return { ok: false, credential: 'error', message: 'Error al obtener Argon2 (desde dbQueries).' };
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
        
        let ip = req.headers['x-forwarded-for']?.split(',')[0]
            || req.socket.remoteAddress
            || '0.0.0.0';
        const date = new Date();
        if(ip.startsWith('::ffff:')) { ip = ip.replace('::ffff:', '') };

        const [result] = await mysql.query('call iniciarSesion(?,?,?,?,?,?,?);', [
            id_user, device, ip, os, browser, date, date
        ]);
        
        const response = result[0][0];
        if(!response.ok) return { ok:false, credential:'error', message: response.error };

        return {
            ok: true,
            session: {
                sid: response.sid,
                last_activity: response.last_activity,
                uid: response.uid,
                name: response.nombre,
                last_name: response.apellido
            },
        };
    } catch (error) {
        console.error('Error al iniciar sesión (desde dbQueries): ', error);
        return { ok: false, credential:'error', message: 'No se ha podido iniciar sesión ni recibir las credenciales.' };
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
        console.error('Error al objeter los datos del usuario (desde dbQueries): ', error);
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
        console.error('No se puedo crear el ticket (desde dbQueries): ', error);
        return { ok: false, error: 'No se pudo crear el ticket.' };
    }
}
// ===========================================================================================================================
// type: 'Aprobados' || ''
async function getTickets(usuario_id, page=1, type='Aprobados') {

    if (!['Aprobados',''].includes(type)) return { ok:false, error:'Tipo de ticket inválido.' };
    if(!utils.isNatural(page)) return { ok:false, error:'Número de página inválido.' };

    try {
        const [result] = await mysql.query(`call obtenerTickets(?,?,?)`, [ usuario_id, page, type ]);
        const tickets = result[0][0];

        if(!tickets.ok) return { ok: false, error: tickets.error };
        if('status' in tickets) return { ok:true, status: tickets.status };
        
        const merged = utils.mergeTickets(tickets.tickets);
        return { ok: true, tickets: merged };
    } catch( error ) {
        console.error(`Error al intentar obtener los tickets ${type}: ${ error }`);
        return { ok: false, error:`No se pudo obtener los tickets ${type}.`}
    }
}
// ===========================================================================================================================
async function getMessages(me_id, other_id, ticket_id, page=1) {
	try {
		const [result] = await mysql.query('call obtenerMensajes(?,?,?,?)', [
			me_id, other_id, ticket_id, page
		]);
		const data = result[0] || [];
		
		return { ok: true, data };
	} catch (error) {
		console.error('Error al intentar obtener los mensajes (desde dbQueries): ', error);
		return { ok: false, error: 'No se pudieron obtener los mensajes.' };
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
		console.error('Error al intentar verificar la existencia del usuario (desde dbQueries): ', error);
		return { ok: false, error: 'No se pudieron verificar si el usuario existe.' };
	}
}
// ===========================================================================================================================
async function getUserPermissions(id) {
    try {
        const [result] = await mysql.query('call obtenerPermisosUsuario(?)', [id]);
        const user = result[0][0];

        user.permissions = await utils.jsonToObject(user.permissions);
        return { ok: true, data: user };
    } catch (error) {
        console.error('Error al intentar obtener los permisos de usuario (desde dbQueries): ', error);
        return { ok: false, error:'No se puedo obtener los permisos del usuario' };
    }
}
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
    getUserPermissions,
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