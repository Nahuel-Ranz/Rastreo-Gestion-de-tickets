const { srcPath } = require('../utils/utils');
const { email } = require(`${srcPath}envCredential`);
const { getRedis } = require(`${srcPath}storage/connections`);
const nodemailer = require('nodemailer');

const mailer = nodemailer.createTransport({
    service: email.service,
    auth: { user: email.user, pass: email.password }
});

async function sendMail(destination, subj, htmlContent) {
    try {
        const mail = {
            from: email.user,
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
    await cli.set(`verify:${mail}`, code, 'EX', 120);

    let mail_body = '';
    let subj = '';
    switch(type) {
        case "register":
            mail_body = `<p>Su código de confimación es: <strong>${code}</strong>.</p><p>El código caducará en 2 minutos</p>`;
            subj = 'Código de verificación del correo';
            break;
        case "re-send_code":
            mail_body = `<p>Su nuevo código es: <strong>${code}</strong>.</p><p>Caducará en 2 minutos</p>`;
            subj = 'Reenvío: Código de verificación';
            break;
    }

    await sendMail(mail, subj, mail_body);
}

module.exports = { sendMail, sendCodeByMail };