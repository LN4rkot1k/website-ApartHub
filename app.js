require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const path = require('path');
const indexRouter = require('./routes/indexRoutes');
const authRouter = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const rateLimiter = require('./middleware/requestLimiters');

const passport = require('./config/passport');
const bodyParser = require('body-parser');


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts',
    partialsDir: 'views/partials'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', [
    path.join(__dirname, 'views'),
    path.join(__dirname, 'views', 'login'),
    path.join(__dirname, 'views', 'admin')
]);

app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// middleware для передачи информации об аутентификации в каждый шаблон
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.user = req.user;
    res.locals.isAdmin = req.isAuthenticated() && req.user && req.user.role === "admin";
    next();
});
app.use(passport.authenticate('session'));

app.use(flash());

app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});


