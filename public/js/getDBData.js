const { obtenerAreas } = require('../../controllers/viewController.js');

exports.renderAreas = async (req, res) => {
    try {
        const areas = await obtenerAreas();
        res.render('forms/register', { areas });
    } catch(error) {
        console.error('Error al renderizar el formulario de registro: ', error);
        res.render('forms/register', { areas: [] })
    }
};