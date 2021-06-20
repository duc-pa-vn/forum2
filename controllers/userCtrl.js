const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
    // console.log(req.body.password);
    var hash_password = await bcrypt.hash(req.body.password.toString().trim(), 10);
    // console.log(hash_password);
    var user = {
        full_name: req.body.full_name,
        email: req.body.email,
        hash_password,
        nickname: req.body.nickname,

    }
    User.create(user)
    .then(user => res.json({
        mess: 'add successfully'
    }))
    .catch(err => {
        console.log(err);
        res.json({
        mess: 'add fault'
    })})
}

const login = (req, res) => {
    var nickname = req.body.nickname.toString();
    var password = req.body.password.toString();
    User.findOne({
        where:{
            nickname
        }
    }).then(user => {
        if(user){
            bcrypt.compare(password, user.hash_password, (err, suc) => {
                if(err){
                    res.json({
                        mess: 'compare err',
                        err
                    })
                }
                if(suc){
                    let token = jwt.sign({nickname}, process.env.TOKEN, {expiresIn: '24h'});
                    res.json({
                        token
                    })
                }
                else{
                    res.json({
                        mess: 'wrong password'
                    })
                }
            })
        }
        else{
            res.json({
                mess: 'nickname doesn\'t exist'
            })
        }
    }).catch(err => {
        res.json({
            mess: 'find err',
            err
        })
    })
}
module.exports = {
    register,
    login
}