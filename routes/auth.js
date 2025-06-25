const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validaciones básicas
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Crear nuevo usuario
        const newUser = new User({ name, email, password });
        await newUser.save();

        // Generar JWT
        const token = jwt.sign({ sub: newUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Login de usuario
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: info.message || 'Autenticación fallida'
            });
        }

        // Generar token JWT
        const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        return res.json({ 
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    })(req, res, next);
});

// Verificar token
router.get('/verify', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ 
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        }
    });
});


module.exports = router;