const { srcPath } = require('../utils/utils');
const { getRedis } = require(`${srcPath}storage/connections`);

let cli = null;
(async () => {
	const redis = await getRedis();
	cli = redis.cli;
})();

module.exports = {
    isAuthenticated: async (req, res, next) => {
        const sid = req.cookies?.sid;
        if(!sid) return res.redirect('/');
        
        const uid = await cli.get(`sess:${sid}`);
        if(!uid) return res.redirect('/');

        req.uid = uid;
        next();
    },

    isGuest: async (req, res, next) => {
        const sid = req.cookies?.sid;
        if(!sid) return next();

        const uid = await cli.get(`sess:${sid}`);
        if(uid) return res.redirect('/lista_de_espera');

        next();
    }
}
