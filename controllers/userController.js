const argon2 = require('argon2');
const spQueries = require('../storage/spQueries.js');

const userController = {};

userController.login = async (req, res) => {
    const {credential, password } = req.body;

    const data = await spQueries.getArgon2Hash(credential);
    if(!data.ok) return res.render('forms/login', { error: data.error});

    const verified = await argon2.verify(data.hash, password);
    if(!verified) return res.render('forms/login', { error: 'Contraseña incorrecta' });

    const sessionData = await initSession(req, data.id);
    if(!sessionData.ok) return res.render('forms/login', { error: sessionData.error });

    req.session.sessionId = sessionData.data.id;
    req.session.user = sessionData.data.usuario;
    req.session.rol = sessionData.data.rol;
    req.session.permissions = sessionData.data.permisos;
    return res.redirect('/lista_de_espera');
};

userController.logout = async (req, res) => {
    req.session.destroy( error  => {
        if (error) console.error('Error al cerrar sesión (desde userController): ', error);

        res.redirect('/');
    });
};

module.exports = userController;