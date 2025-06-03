const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('../database/dbOperations');

// Настройка стратегии аутентификации
passport.use(
    new LocalStrategy(
        { usernameField: 'login', passwordField: 'password' },
        async (login, password, done) => {
            try {
                const user = await db.findUserByLogin(login);
                if (!user) {
                    return done(null, false, { message: "Пользователь не найден" });
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: "Неверный пароль" });
                }

                return done(null, user);
            } catch(error) {
                return done(error);
            }
        }
    )
);


// Сохраняем user_id в сессии
passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

// Загружаем пользователя из сессии
passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.findUserById(id);
        done(null, user);
    } catch(error) {
        done(error);
    }
});

module.exports = passport;