module.exports = {
    refreshSessionCookie: (req, res, next) => {
        const sid = req.cookies?.sid;
        if(!sid) return next();

        res.cookie('sid', sid, {
            httpOnly: true,
            maxAge: 1800 * 1000,
            secure: false,
            sameSite: 'Lax',
            path: '/'
        });

        next();
    }
}