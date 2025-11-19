const ejs = require('ejs');
const dbQueries = require('../storage/dbQueries.js');
const { ejsPath, sendCodeByMail } = require('../utils/utils.js');

const registerController = {}

registerController.checkNewUser = async (req, res) => {
    const { dni, cel, mail } = req.body;

    const data = await dbQueries.checkNewUser(dni, cel, mail);
    return res.json(data);
};

registerController.sendCode = async (req, res) => {
    try {
        const correo = req.body.correo?.trim();
        if(!correo) return res.json({ ok: false, credential:'mail', message:'Hubo un error con el correo ingresado.'});
        
        const formContent = await ejs.renderFile(`${ejsPath}components/form_content/email_validation_code.ejs`,
            { correo, ejsPath }
        );
        
        const form = await ejs.renderFile(`${ejsPath}components/forms.ejs`,
            { id:'modal_form', title:'CONFIRMAR LA EXISTENCIA DEL CORREO', content: formContent }
        );
        
        const modal = await ejs.renderFile(`${ejsPath}components/modal.ejs`,
            { title:'Verificación del correo', content: form }
        );
        
        await sendCodeByMail(correo, 'register');

        return res.json({ ok:true, modal });
    } catch ( error ) {
        console.log(`Ha ocurrido un error al intenar envíar el correo: ${error}`);
        return res.json({ ok: false, error:`Error en la generación o envío del código. ${error}`});
    }
};

registerController.reSendCode = async (req,res) => {
    try {
        await sendCodeByMail(req.body.mail, 're-send_code');

        return res.json({ ok:true, message:'El nuevo código fue enviado a su correo. Caducará en 10 minutos.'});
    } catch ( error ) {
        console.log(`Ha ocurrido un error al intenar re-envíar el correo: ${error}`);
        return res.json({ ok: false, error:`Error en la re-generación o re-envío del código. ${error}`});
    }
};

module.exports = registerController;