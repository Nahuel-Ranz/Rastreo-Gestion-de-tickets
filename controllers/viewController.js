const ejs = require('ejs');
const { ejsPath } = require('../utils/utils.js');
const dbQueries = require('../storage/dbQueries.js');
// =================================================================================================================
async function renderLogin(req, res) {
    try {
        const formContent = await ejs.renderFile(`${ejsPath}components/form_content/login.ejs`, { ejsPath });
        const form = await ejs.renderFile(`${ejsPath}components/forms.ejs`,
            { id:'page_form', title:'INICIAR SESIÓN', content: formContent }
        );
    
        res.render('base.ejs', { title: 'Iniciar Sesión', content: form });
    } catch(error) {
        console.error(error);
        res.send('Ha ocurrido un error intentando obtener el formulario de Inicio de Sesión.');
    }
}
// =================================================================================================================
async function renderRegister(req, res) {
    try {
        const result = await dbQueries.getAreas();
        const formContent = await ejs.renderFile(`${ejsPath}components/form_content/register.ejs`,
            { ejsPath, areas: result.data }
        );
        const form = await ejs.renderFile(`${ejsPath}components/forms.ejs`,
            { id:'page_form', title:'REGISTRARSE', content: formContent }
        );

        res.render('base.ejs', { title: 'Registro', content: form });
    } catch(error) {
        console.log(error);
        res.send('Ha ocurrido un error intentando obtener el formulario de Registro.');
    }
}
// =================================================================================================================
async function showWaitingList(req, res) {
    
    const up = await dbQueries.getUserPermissions(req.session.userId);
    if(!up.ok) return res.render('index', { error: up.error, login:true });

    const tickets = await dbQueries.getTickets(
        req.session.userId, 1, ''
    );

    if(!tickets.ok) return res.render('index', { error: tickets.error, login:true });
    if('status' in tickets) return res.render('index', { status: tickets.status, login:true });
    
    // up.data: { full_name, permissions }
    return res.render('index', { tickets: tickets.tickets, user: up.data, login:true });
}
// =================================================================================================================
module.exports = {
    renderLogin,
    renderRegister,
    showWaitingList
}