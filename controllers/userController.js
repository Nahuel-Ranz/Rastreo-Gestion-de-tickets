const argon2 = require('argon2');
const dbQueries = require('../storage/dbQueries.js');
const utils = require('../utils/utils.js');

const userController = {};

userController.login = async (req, res) => {
    const {credential, pass } = req.body;

    const data = await dbQueries.getArgon2Hash(credential);
    if(!data.ok) return res.json(data);

    const verified = await argon2.verify(data.hash, pass);
    if(!verified) return res.json({ ok:false, credential:'pass', message: 'Contraseña incorrecta' });

    const sessionData = await dbQueries.initSession(req, data.id);
    if(!sessionData.ok) return res.json(sessionData);

    req.session.dbSessionId = sessionData.session.id;
    req.session.userId = sessionData.session.userId;
    req.session.lastActivity = sessionData.session.last_activity;
    return res.redirect('/lista_de_espera');
};

userController.logout = async (req, res) => {
    const id = req.session?.dbSessionId;

    try {
        await utils.destroySession(req);
        if(id) {
            const ans = await dbQueries.closeSession(id);
            if(!ans.ok) return res.render('index', { error_logout: ans.error });
        }

        return res.redirect('/');
    } catch (error) {
        console.error('Error al cerrar sesión (desde useController): ', error);
        return res.render('index', { error_logout: 'No se pudo cerrar la sesión correctamente (desde userController). Intentelo de nuevo!'});
    }
};

module.exports = userController;