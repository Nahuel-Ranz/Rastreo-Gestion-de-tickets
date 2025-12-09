const argon2 = require('argon2');
const ejs = require('ejs');
const utils = require('../utils/utils.js');
const dbQueries = require(`${utils.srcPath}storage/dbQueries`);
const { getRedis } = require(`${utils.srcPath}storage/connections`);

const userController = {};

userController.login = async (req, res) => {
    const { credential, pass } = req.body;

    const data = await dbQueries.getArgon2Hash(credential);
    if(!data.ok) return res.json(data);

    const verified = await argon2.verify(data.hash, pass);
    if(!verified) return res.json({ ok:false, credential:'pass', message: 'Contraseña incorrecta' });

    const sessionData = await dbQueries.initSession(req, data.id);
    if(!sessionData.ok) return res.json(sessionData);

    const { sid, uid, last_activity } = sessionData.session;
    const { cli } = await getRedis();
    
    await cli.set(`sess:${sid}`, uid, 'EX', 1800);
    res.cookie('sid', sid, {
        httpOnly: true,
        maxAge: 1800 * 1000,
        secure: false,
        sameSite: 'Lax',
        path: '/'
    });
    
    return res.json({ ok:true, redirect:'/lista_de_espera'});
};

userController.logout = async (req, res) => {
    const sid = req.cookies?.sid;
    const { cli } = await getRedis();

    const modal = await ejs.renderFile(`${utils.ejsPath}components/modal.ejs`,
        { title:'Sesión', content: '<h1>Sesión Cerrada</h1>' }
    );

    const sockets = sid ? await cli.smembers(`sess_socket:${sid}`) : [];
    for(const id of sockets) io.to(id).emit('force_logout', { modal });

    res.clearCookie('sid', {
        httpOnly: true,
        secure:false,
        sameSite: 'Lax',
        path: '/'
    });
    
    await cli.del(`sess:${sid}`);
    await cli.del(`sess_socket:${sid}`);

    if(sid) {
        const ans = await dbQueries.closeSession(sid);
        if(!ans.ok) return res.json({ ok:false, error: ans.error});
    }

    return res.json({ ok:true, redirect:'/'});
};

module.exports = userController;