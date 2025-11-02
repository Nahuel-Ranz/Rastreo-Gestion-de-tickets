const { mysql } = require('../storage/connections.js');

exports.obtenerAreas = async (req, res) => {
    try {
        const [rows] = await mysql.query('call obtenerAreas(@ok, @message);');
        const [out] = await mysql.query('select @ok as ok, @message as message;');

        const ok = out[0].ok;
        const data = rows[0] || []; console.log(data);

        return ok ? data.map( a => ({
            value: a.abreviacion,
            content: a.nombre
        })) : [];
    } catch (error) {
        console.error('Error al obtener las áreas: ', error);
        res.status(500).send('Error del servidor');
    }
};