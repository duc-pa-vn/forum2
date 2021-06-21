const express = require('express');
const Router = express.Router();
const userCtrl = require('../controllers/userCtrl');

Router.get('/login', (req,res) => {
    res.render('login');
});

Router.post('/login', userCtrl.login);

Router.post('/register', userCtrl.register);

Router.get('/verify/:token', userCtrl.verifyEmail);

module.exports = Router;