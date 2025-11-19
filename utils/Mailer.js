require('dotenv').config();
const nodemailer = require('nodemailer');

const mailer = nodemailer.createTransport({
    service: process.env.EMAIL_SERV,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports = mailer;