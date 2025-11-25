const path = require('path');
const { getRedis } = require('../storage/connections.js');
const mailer = require('./Mailer.js');

const ejsPath = path.join(__dirname, '../views/partials/');

function isNatural(value) {
    return Number.isFinite(value)
        && Number.isInteger(value)
        && value >= 0;
}

function mergeTickets(tickets) {
    let parsed;
    try { parsed = JSON.parse(tickets); }
    catch (error) {
        console.error('Error durante el parseo: ', error);
        return [];
    }

    if(parsed.propios && parsed.ajenos && parsed.propios.length && parsed.ajenos.length) {
        const merged = [... parsed.propios, ... ajenos];

        merged.sort((a,b) => b.id - a.id);
        return merged;
    }

    if(parsed.propios?.length) return parsed.propios;
    if(parsed.ajenos?.length) return parsed.ajenos;

    return [];
}

function jsonToObject(value) {
    try { return JSON.parse(value); }
    catch { return value; }
}

function destroySession(req) {
    return new Promise((resolve, reject) => {
        req.session.destroy( error => {
            if (error) reject(error);
            else resolve();
        });
    });
}

async function sendMail(destination, subj, htmlContent) {
    try {
        const mail = {
            from: process.env.EMAIL_USER,
            to: destination,
            subject: subj,
            html: htmlContent
        }

        const info = await mailer.sendMail(mail);
        console.log(`📨 Correo enviado a ${ destination }: ${ info.response }`);
    } catch(error) {
        console.error(`❌ Error al enviar correo a ${ destination }: ${ error }`);
    }
}

async function sendCodeByMail(mail, type) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { cli } = await getRedis();
    await cli.set(`verify:${mail}`, code, 'EX', 600);

    let mail_body = '';
    let subj = '';
    switch(type) {
        case "register":
            mail_body = `<p>Su código de confimación es: <strong>${code}</strong>.</p><p>El código caducará en 10 minutos</p>`;
            subj = 'Código de verificación del correo';
            break;
        case "re-send_code":
            mail_body = `<p>Su nuevo código es: <strong>${code}</strong>.</p><p>Caducará en 10 minutos</p>`;
            subj = 'Reenvío: Código de verificación';
            break;
    }

    await sendMail(mail, subj, mail_body);
}

module.exports = {
    destroySession,
    ejsPath,
    isNatural,
    jsonToObject,
    mergeTickets,
    sendCodeByMail,
    sendMail
}