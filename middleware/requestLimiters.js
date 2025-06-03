const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const speedLimiter = slowDown({
    windowMs: 1 * 60 * 1000,
    delayAfter: 15,
    delayMs: () => 500
});

const authLimiter = rateLimit({
    // максимум 7 попыток в минуту
    windowMs: 60 * 1000,
    max: 30,
    message: 'Слишком много попыток входа. Попробуйте позже'
});

const profileLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 40,
    message: 'Слишком много действий. Попробуйте позже'
});


module.exports = { authLimiter, profileLimiter, speedLimiter };