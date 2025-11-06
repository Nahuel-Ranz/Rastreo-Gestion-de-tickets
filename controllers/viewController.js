const spQueries = require('../storage/spQueries.js');

async function showRegister(req, res) {
    const result = await spQueries.getAreas();

    res.render('forms/register', { areas: result.data });
}

async function showWaitingList(req, res) {
    const tickets = await spQueries.getTickets(
        req.session.user.id, 1, ''
    );

    if(!tickets.ok) return res.render('index', { error: tickets.error});
    if('status' in tickets) return res.render('index', { status: tickets.status });
    return res.render('index', { tickets: tickets.tickets });
}

module.exports = {
    showRegister,
    showWaitingList
}