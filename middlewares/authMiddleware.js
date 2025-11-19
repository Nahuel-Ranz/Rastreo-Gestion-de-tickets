module.exports = {
    isAuthenticated: (req, res, next) => {
        if(req.session && req.session.userId) return next();
        
        return res.redirect('/');
    },

    isGuest: (req, res, next) => {
        if(req.session && req.session.userId) return res.redirect('/lista_de_espera');

        return next();
    }
}
