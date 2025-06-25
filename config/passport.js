const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Estrategia Local para login con email/contraseña
passport.use(new LocalStrategy({
    usernameField: 'email',  // Usamos email como campo de usuario
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        // 1. Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Usuario no encontrado' });
        }

        // 2. Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Contraseña incorrecta' });
        }

        // 3. Si todo es correcto, retornar el usuario
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

module.exports = passport;