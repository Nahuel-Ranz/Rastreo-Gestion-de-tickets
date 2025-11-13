const spQueries = require('../storage/spQueries.js');

const registerController = {}

registerController.checkNewUser = async (req, res) => {
    const { dni, cel, mail } = req.body;

    const data = await spQueries.checkNewUser(dni, cel, mail);
    return res.json(data);
};

module.exports = registerController;