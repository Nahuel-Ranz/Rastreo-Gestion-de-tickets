const spQueries = require('../storage/spQueries.js');

async function showRegister(req, res) {
    const result = await spQueries.getAreas();

    res.render('forms/register', { areas: result.data });
}

async function showWaitingList(req, res) {
    
}

module.exports = { showRegister }