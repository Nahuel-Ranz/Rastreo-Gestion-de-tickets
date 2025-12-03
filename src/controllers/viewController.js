const ejs = require('ejs');
const { ejsPath, srcPath } = require('../utils/utils');
const dbQueries = require(`${srcPath}storage/dbQueries`);
const { getRedis } = require(`${srcPath}storage/connections`);
// =================================================================================================================
async function renderLogin(req, res) {
    try {
        const formContent = await ejs.renderFile(`${ejsPath}components/form_content/login.ejs`, { ejsPath });
        const form = await ejs.renderFile(`${ejsPath}components/forms.ejs`,
            { id:'page_form', title:'INICIAR SESIÓN', content: formContent }
        );
    
        res.render('base.ejs', { title:'Iniciar Sesión', content:form, login:false });
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

        res.render('base.ejs', { title:'Registro', content:form, login:false });
    } catch(error) {
        console.log(error);
        res.send('Ha ocurrido un error intentando obtener el formulario de Registro.');
    }
}
// =================================================================================================================
async function renderSetPassword(req, res) {
    try {
        const { token } =  req.query;
        
        const formContent = await ejs.renderFile(`${ejsPath}components/form_content/set_password.ejs`,
            { ejsPath, token }
        );
        const form = await ejs.renderFile(`${ejsPath}components/forms.ejs`,
            { id:'page_form', title:'ESTABLECER CONTRASEÑA', content: formContent }
        );
        
        res.render('base.ejs', { title:'Establecer Contraseña', content:form, login:false });
    } catch(error) {
        console.error(error);
        res.send('Ha ocurrido un error intentando obtener el formulario para establecer la contraseña.');
    }
}
// =================================================================================================================
async function renderWaitingConfirm(req, res) {
    try {
        const { userId } = req.query;

        const formContent = await ejs.renderFile(`${ejsPath}components/form_content/waiting_admin_confirmation.ejs`,
            { userId, ejsPath }
        );
        const form = await ejs.renderFile(`${ejsPath}components/forms.ejs`,
            { id:'page_form', title: 'ESPERANDO CONFIRMACIÓN', content: formContent }
        );
        res.render('base.ejs', { title:'Esparando Confirmación del Administrador', content: form, login:false });
    } catch(error) {
        console.error(error);
        res.send('Aunque su registro se completó, ocurrió un error al intenter obtener la página de confirmación. Su numero de usuario es: ', userId);
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
    renderSetPassword,
    renderWaitingConfirm,
    showWaitingList
}