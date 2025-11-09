const spQueries = require('../storage/spQueries.js');

async function showRegister(req, res) {
    const result = await spQueries.getAreas();

    res.render('forms/register', { areas: result.data, login:false });
}

async function showWaitingList(req, res) {
    
    const up = await spQueries.getUserPermissions(req.session.userId);
    if(!up.ok) return res.render('index', { error: up.error, login:true });

    const tickets = await spQueries.getTickets(
        req.session.userId, 1, ''
    );

    if(!tickets.ok) return res.render('index', { error: tickets.error, login:true });
    if('status' in tickets) return res.render('index', { status: tickets.status, login:true });
    
    // up.data: { full_name, permissions }
    return res.render('index', { tickets: tickets.tickets, user: up.data, login:true });
}

module.exports = {
    showRegister,
    showWaitingList
}