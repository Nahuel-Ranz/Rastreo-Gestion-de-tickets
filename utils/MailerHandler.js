const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(recipient, subj, message) {
    try {
        const info = await transporter.sendMail({
            from: `Rastreo - Gestión de Tickets <${process.env.EMAIL_FROM}>`,
            to: recipient,
            subject: subj,
            html: message
        });

        console.log('Mail sent');
    } catch(error) {
        console.log('Error al enviar el correo: ', error);
    }
}

module.exports = sendEmail;