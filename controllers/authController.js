const bcrypt = require('bcryptjs');
const db = require('../database/dbOperations');
const passport = require('passport')

const registerUser = async (req, res) => {
    const { login, password, name, phone_number } = req.body;

    if (!login || !password || !name || !phone_number) {
        return res.render('registerUser', {
            registerPage: true,
            error: "Все поля обязательны для заполнения",
            login, name, phone_number
        });
    }

    try {
        const existingUser = await db.findUserByLogin(login);
        if (existingUser) {
            return res.render('registerUser', {
                registerPage: true,
                error: "Данный логин уже занят",
                name, phone_number
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.createUser({
            login,
            password: hashedPassword,
            name,
            phone_number,
            role: 'user'
        });

        req.login(newUser, (err)  => {
            if (err) {
                console.error("Ошибка при автоматическом входе:", err);
                return res.render('registerUser', { registerPage: true, error: "Ошибка при автоматическом входе" });
            }
            console.log("Register route finished succesfully");
            res.redirect('/');
        });

    } catch (error) {
        console.error("Ошибка при регистрации:", error);
        res.render('registerUser', { registerPage: true, error: "Ошибка сервера" });
    }
};

const login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login?error=Неверный логин или пароль',
        failureFlash: false
    })(req, res, next);
};

const loginAdmin = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/admin/login?error=Неверный логин или пароль',
        failureFlash: false
    }) (req, res, next);
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.redirect('/admin/login');
};

const logoutAdmin = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Ошибка при выходе администратора', err);
            return res.redirect('/admin?error=Ошибка при выходе');
        }

        res.clearCookie('connect.sid');

        req.session.destroy((err) => {
            if (err) {
                console.error("Ошибка при удалении сессии админстратора", err);
                return res.redirect('/admin/login?error=Ошибка при удалении сессии');
            }
            res.redirect('/');
        });
    });
};

const logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Ошибка при выходе:", err);
            return res.status(500).json({message: "Ошибка при выходе"});
        }

        res.clearCookie('connect.sid');

        req.session.destroy((err) => {
            if (err) {
                console.error("Ошибка при удалении сессии:", err);
                return res.status(500).json({message: "Ошибка при удалении сессии"});
            }
            res.redirect('/');
        });
    });
};

const showUserProfilePage = (req, res) => {
    if (req.isAuthenticated()) {
        res.render('userProfile', { user: req.user, userProfilePage: true });
    } else {
        res.redirect('/login');
    }
};

const showAdminProfilePage = (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        res.render('adminProfile', {user: req.user, adminProfilePage: true});
    } else {
        res.redirect('/admin/login');
    }
};

const getLoginPage = (req, res) => {
        console.log("Render login page");
    res.render('loginUser', { loginPage: true, error: req.query.error });
};

const getLoginAdminPage = (req, res) => {
    console.log("Render login admin page");
    res.render('loginAdmin', { loginAdminPage: true, error: req.query.error });
};

const getRegisterPage = (req, res) => {
    res.render('registerUser', { registerPage: true, error: req.query.error });
};

module.exports = {
    registerUser, login,
    logoutUser, showUserProfilePage, getLoginPage,
    getRegisterPage, getLoginAdminPage, loginAdmin,
    isAdmin, logoutAdmin, showAdminProfilePage
};