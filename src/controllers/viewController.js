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
async function renderRecoveryPasswordEmail(req, res) {
    try {
        const formContent = await ejs.renderFile(`${ejsPath}components/form_content/recovery_email.ejs`,{ ejsPath });
        const form = await ejs.renderFile(`${ejsPath}components/forms.ejs`,
            { id:'page_form', title: 'RECUPERACIÓN DE CONTRASEÑA', content: formContent }
        );
        res.render('base.ejs', { title:'Recuperación de la contraseña', content: form });
    } catch(error) {
        console.error(error);
        res.send('No se ha podido cargar el formulario de recuperación de la contraseña: ', error);
    }
}
// =================================================================================================================
async function renderRecoveryPasswordNewPassword(req, res) {
    try {
        const formContent = await ejs.renderFile(`${ejsPath}components/form_content/recovery_new_password.ejs`,{ ejsPath });
        const form = await ejs.renderFile(`${ejsPath}components/forms.ejs`,
            { id:'page_form', title: 'INTRODUZCA SU NUEVA CONTRASEÑA', content: formContent }
        );
        res.render('base.ejs', { title:'Recuperación - Nueva Contraseña', content: form });
    } catch(error) {
        console.error(error);
        res.send('Error al cargar el formulario de nueva contraseña: ', error);
    }
}
// =================================================================================================================
async function renderUpdatedPassword(req, res) {
    try {
        const formContent = await ejs.renderFile(`${ejsPath}components/form_content/updated_password.ejs`,{ ejsPath });
        const form = await ejs.renderFile(`${ejsPath}components/forms.ejs`,
            { id:'page_form', title: 'CONTRASEÑA ACTUALIZADA', content: formContent }
        );
        res.render('base.ejs', { title:'Contraseña Actualizada', content: form });
    } catch(error) {
        console.error(error);
        res.send('Aunque la contraseña ha sido correctamente actualizada, hubo un error al cargar la confirmación: ', error);
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

        const completedName = await fullName(req);
        const linkMenuOptions = await navBarMenu();
		const nav = await ejs.renderFile(`${ejsPath}components/header_nav.ejs`, {
            ejsPath,
            fullName: completedName,
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

        const completedName = await fullName(req);
        const linkMenuOptions = await navBarMenu();
		const nav = await ejs.renderFile(`${ejsPath}components/header_nav.ejs`, {
            ejsPath,
            fullName: completedName,
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
async function renderProfile(req, res) {
	try {

        const completedName = await fullName(req);
        const linkMenuOptions = await navBarMenu();
		const nav = await ejs.renderFile(`${ejsPath}components/header_nav.ejs`, {
            ejsPath,
            fullName: completedName,
            linkMenuOptions: linkMenuOptions.join(''),
            notifications: '<li>No Hay notificaciones aún</li>'
        });
		
        const card = await ejs.renderFile(`${ejsPath}components/card.ejs`,
            { id:'card-container', title:'Perfil', content: '<p>Primer Contenido</p>' }
        );

		res.render('base.ejs', { title: 'Cola de ejecución', content: card, nav });
	} catch (error) {
        console.error(error);
        res.send('Error al intetar obtener los datos del perfil: ', error);
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
            { get:i.get, destination:i.destination, description:i.description, icon:i.icon, ejsPath })
        );
    }

    return items || [{get:true, destination:'#', description:'NONE', icon:'fas fa-question-circle'}];
}
// =================================================================================================================
async function fullName(req) {
    const sid = req.cookies?.sid;
    if(!sid) return 'Usuario';

    const { cli } = await getRedis();
    let sess = await cli.get(`sess:${sid}`);
    sess = JSON.parse(sess);

    return `${sess.name} ${sess.last_name}`;
}
// =================================================================================================================
module.exports = {
    renderExecutionQueue,
    renderLogin,
    renderProfile,
    renderRecoveryPasswordEmail,
    renderRecoveryPasswordNewPassword,
    renderRegister,
    renderSetPassword,
    renderUpdatedPassword,
    renderWaitingConfirm,
	renderWaitingList
}