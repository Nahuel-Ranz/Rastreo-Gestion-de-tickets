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
        
        const session = await cli.get(`sess:${sid}`);
        if(!session) return res.redirect('/');

        req.userId = JSON.parse(session);
        next();
    },

    isGuest: async (req, res, next) => {
        const sid = req.cookies?.sid;
        if(!sid) return next();

        const session = await cli.get(`sess:${sid}`);
        if(session) return res.redirect('/lista_de_espera');

        next();
    }
}
