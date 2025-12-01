const { srcPath } = require('../utils/utils');
const dbQueries = require(`${srcPath}storage/dbQueries`);

const limit = 30 * 60 * 1000;
const min_db_update = 2 * 60 * 1000;
module.exports = async function (req, res, next) {
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/)) return next();
    if(!req.session || !req.session.dbSessionId) return next();

    const now = Date.now();
    if(!req.session.lastActivity) { req.session.lastActivity = now; return next(); }

    const diff = now - req.session.lastActivity;
    if (diff > limit) {
        await dbQueries.closeSession(req.session.dbSessionId, now);

        return req.session.destroy(() => { return res.redirect("/?timeout=1") });
    }

    if(diff > min_db_update) await dbQueries.updateLastActivity(req.session.dbSessionId, now);
    
    req.session.lastActivity = now;
    next();
}