const ejs = require('ejs');
const crypto = require('crypto');
const { ejsPath, srcPath } = require('../utils/utils');
const dbQueries = require(`${srcPath}storage/dbQueries`);
const { getRedis } = require(`${srcPath}storage/connections`);
const { sendCodeByMail } = require(`${srcPath}services/mailerServices`);

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

        return res.json({ ok:true, message:'El nuevo código fue enviado a su correo. Caducará en 2 minutos.'});
    } catch ( error ) {
        console.error(`Ha ocurrido un error al intenar re-envíar el correo: ${error}`);
        return res.json({ ok: false, error:`Error en la re-generación o re-envío del código. ${error}`});
    }
};

registerController.checkCode = async (req, res) => {
	try {
		const { code, mail } = req.body;
		const { cli } = await getRedis();

		const cod = await cli.get(`verify:${mail}`);
		if(code === cod) return res.json({ ok: true });
		
        return res.json({ ok:false, credential:'code', message:'El código ingresado es incorrecto.'});
	} catch(error) {
		console.error(`Ha ocurrido un error al verificar el código introducido: ${error}`);
		return res.json({ ok:false, error:`Error en la verificación del código: ${error}`});
	}
};

registerController.saveNormalizedData = async (req, res) => {
    try {
        const { cli } = await getRedis();
        const cleanData = req.body;
        const token = crypto.randomUUID();
        
        await cli.set(`register:${token}`, JSON.stringify(cleanData), 'EX', 300);
        return res.json({ ok:true, redirect:`/establecer_clave?token=${token}`});
    } catch ( error ) {
		console.error(`Ha ocurrido un error al obtener el token de los datos limpios a Redis: ${error}`);
		return res.json({ ok:false, error:`El token no se ha podido obtener: ${error}`});
    }
};

module.exports = registerController;