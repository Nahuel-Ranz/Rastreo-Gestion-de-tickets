const argon2 = require('argon2');
const spQueries = require('../storage/spQueries.js');
const utils = require('../utils/utils.js');

const userController = {};

userController.login = async (req, res) => {
    const {credential, password } = req.body;

    const data = await spQueries.getArgon2Hash(credential);
    if(!data.ok) return res.render('forms/login', { error: data.error});

    const verified = await argon2.verify(data.hash, password);
    if(!verified) return res.render('forms/login', { error: 'Contraseña incorrecta' });

    const sessionData = await spQueries.initSession(req, data.id);
    if(!sessionData.ok) return res.render('forms/login', { error: sessionData.error });

    // req.session.id
    // req.session.last_activity
    // req.session.userId
    req.session = sessionData.session;
    return res.redirect('/lista_de_espera');
};

userController.logout = async (req, res) => {
    const id = req.session?.session?.id;

    try {
        await utils.destroySession(req);
        if(id) {
            const ans = await spQueries.closeSession(id);
            if(!ans.ok) return res.render('index', { error_logout: ans.error });
        }

        return res.redirect('/');
    } catch (error) {
        console.error('Error al cerrar sesión (desde useController): ', error);
        return res.render('index', { error_logout: 'No se pudo cerrar la sesión correctamente (desde userController). Intentelo de nuevo!'});
    }
};

module.exports = userController;