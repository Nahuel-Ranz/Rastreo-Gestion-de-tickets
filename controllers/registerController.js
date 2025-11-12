const spQueries = require('../storage/spQueries.js');

const registerController = {}

registerController.checkNewUser = async (req, res) => {
    const { dni, cel, mail } = req.body;

    const data = await spQueries.checkNewUser(dni, cel, mail);
    if(data[0].credential === 'error') return res.json({ ok: false, data });
    return res.json({ ok:true, data });
};

module.exports = registerController;