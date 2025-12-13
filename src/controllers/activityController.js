const { srcPath } = require('../utils/utils.js');
const dbQueries = require(`${srcPath}storage/dbQueries`);

module.exports = {
    refreshMysqlSession: async (req, res) => {
        try {
            if (req.body.refreshMysql) {
                await dbQueries.updateLastActivity(req.cookies.sid);
            }
            res.sendStatus(200);
        } catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    }
}
