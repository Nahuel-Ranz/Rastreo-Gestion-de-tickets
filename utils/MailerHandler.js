require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERV,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendMail(destination, subj, content) {
    try {
        const mail = {
            from: process.env.EMAIL_USER,
            to: destination,
            subject: subj,
            text: content
        }

        const info = await transporter.sendMail(mail);
        console.log(`📨 Correo enviado a ${ destino }: ${ info.response }`);
    } catch(error) {
        console.error(`❌ Error al enviar correo a ${ destination }: ${ error }`);
    }
}

module.exports = sendMail;