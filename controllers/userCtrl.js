const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = (req, res, next) => {
    var hash_password = bcrypt.hash(req.body.password, 10);
    var user = {
        full_name: req.body.full_name,
        email: req.body.email,
        hash_password,
        nickname: req.body.nickname
    }
    User.create(user)
    .then(user => res.json({
        mess: 'add successfully'
    }))
    .catch(err => res.json({
        mess: 'add fault'
    }))
}

module.exports = {
    register
}