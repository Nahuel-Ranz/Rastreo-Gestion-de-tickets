const { srcPath } = require('../utils/utils.js');
const dbQueries = require(`${srcPath}storage/dbQueries`);

module.exports = {
    refreshMysqlSession: async (req, res) => {
        if(req.body.refreshMysql) {
            await dbQueries.updateLastActivity(req.cookies.sid);
        }
    }
}