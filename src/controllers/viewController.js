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
    
        res.render('base.ejs', { title:'Iniciar Sesión', content:form });
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

        res.render('base.ejs', { title:'Registro', content:form });
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
        
        res.render('base.ejs', { title:'Establecer Contraseña', content:form });
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
        res.render('base.ejs', { title:'Esparando Confirmación del Administrador', content: form });
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
			tickets.push(await ejs.renderFile(`${ejsPath}components/tickets/pending_ticket.ejs`, { id:i } ));
		}
		const collector = await ejs.renderFile(`${ejsPath}components/tickets/ticket_collectors.ejs`,
			{ title:'Lista de espera', options, ejsPath, tickets: tickets.join('') }
		);

        const linkMenuOptions = await navBarMenu();
		const nav = await ejs.renderFile(`${ejsPath}components/header_nav.ejs`, {
            ejsPath,
            linkMenuOptions: linkMenuOptions.join(''),
            notifications: '<li>No Hay notificaciones aún</li>'
        });
		
		res.render('base.ejs', { title: 'Lista de espera', content: collector, nav });
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
			tickets.push(await ejs.renderFile(`${ejsPath}components/tickets/acepted_ticket.ejs`, { id:i }));
		}
		const collector = await ejs.renderFile(`${ejsPath}components/tickets/ticket_collectors.ejs`,
			{ title:'Cola de ejecución', options, ejsPath, tickets: tickets.join('') }
		);

        const linkMenuOptions = await navBarMenu();
		const nav = await ejs.renderFile(`${ejsPath}components/header_nav.ejs`, {
            ejsPath,
            linkMenuOptions: linkMenuOptions.join(''),
            notifications: '<li>No Hay notificaciones aún</li>'
        });
		
		res.render('base.ejs', { title: 'Cola de ejecución', content: collector, nav });
	} catch (error) {
        console.error(error);
        res.send('Ocurrío un error al intentar obtener los tickets');
	}
}
// =================================================================================================================
async function navBarMenu() {
    const items = [];
    const data = [
        {description:'Perfil', icon:'fas fa-user', destination:'/perfil', get:true },
        {description:'Estadísticas', icon:'fas fa-chart-line', destination:'/estadisticas', get:true },
        {description:'Configuración', icon:'fas fa-gear', destination:'/configuraciones', get:true },
        {description:'Notificaciones', icon:'fas fa-envelope', destination:'/notificaciones', get:true },
        {description:'Tipos de cuentas', icon:'fas fa-users', destination:'/tipos_de_cuentas', get:true },
        {description:'Cerrar Sesión', icon:'fas fa-right-from-bracket', destination:'logout', get:false }
    ]

    for(let i of data) {
        items.push(await ejs.renderFile(`${ejsPath}dropdowns/link-dropdown-item.ejs`,
            { get:i.get, destination:i.destination, description:i.description, icon:i.icon })
        );
    }

    return items || [{get:true, destination:'#', description:'NONE', icon:'fas fa-question-circle'}];
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