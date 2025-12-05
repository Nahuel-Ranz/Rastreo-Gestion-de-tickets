const ejs = require('ejs');
const { ejsPath, srcPath } = require('../utils/utils');
const dbQueries = require(`${srcPath}storage/dbQueries`);
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
async function renderWaitingList(req, res) {
	const tickets = [];
	const options = [
        { value:'all', content:'Todos'},
        { value:'unseen', content:'No visto'},
        { value:'seen', content:'Visto'},
        { value:'missing', content:'Falta Información'}
	];
	
	try {
		for(let i = 1; i<10; i++) {
			tickets.push(await ejs.renderFile(`${ejsPath}components/tickets/ticket.ejs`, { id:i }));
		}
		const collector = await ejs.renderFile(`${ejsPath}components/tickets/ticket_collectors.ejs`,
			{ title:'Lista de espera', options, ejsPath, content: tickets.join('') }
		);
		const nav = await ejs.renderFile(`${ejsPath}components/header_nav.ejs`, { ejsPath });
		
		res.render('base.ejs', { title: 'Lista de espera', content: collector, nav, login:true });
	} catch (error) {
        console.error(error);
        res.send('Ocurrío un error al intentar obtener los tickets');
	}
}
// =================================================================================================================
async function renderExecutionQueue(req, res) {
	const tickets = [];
	const options = [
        { value:'all', content:'Todos'},
        { value:'pending', content:'Pendientes'},
        { value:'processing', content:'En ejecución'},
        { value:'finished', content:'Finalizado'},
        { value:'canceled', content:'Cancelado'},
        { value:'undone', content:'No realizado'}
    ];
	
	try {
		for(let i = 1; i<10; i++) {
			tickets.push(await ejs.renderFile(`${ejsPath}components/tickets/ticket.ejs`, { id:i }));
		}
		const collector = await ejs.renderFile(`${ejsPath}components/tickets/ticket_collectors.ejs`,
			{ title:'Cola de ejecución', options, ejsPath, content: tickets.join('') }
		);
		const nav = await ejs.renderFile(`${ejsPath}components/header_nav.ejs`, { ejsPath });
		
		res.render('base.ejs', { title: 'Cola de ejecución', content: collector, nav, login:true });
	} catch (error) {
        console.error(error);
        res.send('Ocurrío un error al intentar obtener los tickets');
	}
}
// =================================================================================================================
module.exports = {
    renderExecutionQueue,
    renderLogin,
    renderRegister,
    renderSetPassword,
    renderWaitingConfirm,
	renderWaitingList
}