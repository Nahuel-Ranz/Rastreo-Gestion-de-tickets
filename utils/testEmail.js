require('dotenv').config();
console.log('HOST:', process.env.EMAIL_HOST);
const sendEmail = require('./MailerHandler');

sendEmail(
    'nahuelranzproyectos@gmail.com',
    'Test message from Nodemailer + brevo',
    '<h1>It works!!!</h1>'
);