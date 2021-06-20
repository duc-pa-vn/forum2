const express = require('express');
const Router = express.Router();
const userCtrl = require('../controllers/userCtrl');

Router.get('/login', (req,res) => {
    res.render('login');
});

Router.post('/login', (req, res) => {

});

Router.post('/register', userCtrl.register);

module.exports = Router;