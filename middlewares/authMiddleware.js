module.exports = {
    isAuthenticated: (req, res, next) => {
        if(req.session && req.session.user) return next();
        
        return res.redirect('/');
    },

    isGuest: (req, res, next) => {
        if(req.session && req.session.user) return res.redirect('/lista_de_espera');

        return next();
    }
}
