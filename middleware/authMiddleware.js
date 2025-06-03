module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login'); // Если пользователь не авторизован, отправляем его на /login
    },

    ensureAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === 'admin') {
            return next();
        }
        // Если не администратор, запрещаем доступ
        res.status(403).json({ message: "Доступ запрещен" });
    }
};