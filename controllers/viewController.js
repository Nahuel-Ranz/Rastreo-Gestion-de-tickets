const { getAreas } = require('../storage/spQueries.js');

async function showRegister(req, res) {
    const result = await getAreas();

    res.render('forms/register', { areas: result.data });
}

module.exports = { showRegister }