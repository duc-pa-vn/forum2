const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const register = async (req, res, next) => {
    // console.log(req.body.password);
    var hash_password = await bcrypt.hash(req.body.password.toString().trim(), 10);
    // console.log(hash_password);
    var user = {
        full_name: req.body.full_name,
        email: req.body.email,
        hash_password,
        nickname: req.body.nickname,
        active: false
    }
    User.create(user)
    .then(user => {
        getVerifyEmail(user.nickname,  user.email);
        res.json({
            mess: 'add successfully'
        })
    })
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
                    if(user.active === false){
                        getVerifyEmail(user.nickname, user.email);
                        res.json({
                            mess: 'An email sent. Active your account'
                        })
                    }else{
                        let token = jwt.sign({nickname}, process.env.LOGIN_TOKEN, {expiresIn: '24h'});
                        res.json({
                            token
                        })
                    }   
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

const verifyEmail = (req, res) => {
    let token = req.params.token;
    jwt.verify(token, process.env.SIGN_UP_TOKEN, (err, user) => {
        if(err) console.log(err);
        else{
            User.update({active: true},{
                where: {
                    nickname: user.nickname
                }
            }).then(() => {
                res.send('ok')
            }).catch(err => {
                res.send(err);
            })
        } 
    });}

function getVerifyEmail(nickname, email) {
    let token = jwt.sign({nickname}, process.env.SIGN_UP_TOKEN, {expiresIn: '24h'});
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL , // TODO: your gmail account
            pass: process.env.EPW  // TODO: your gmail password
        }
    });
    const html = `<p>click this link to confirm your email:</p><a href="http://localhost:6969/user/verify/${token}">click here</a>`;
    // Step 2
    let mailOptions = {
        from: 'dauxanhmaunau@gmail.com', // TODO: email sender
        to: email, // TODO: email receiver
        subject: 'Nodemailer - Test',
        html
        // text: `click this link to confirm: localhost:6969/user/verify/${token}`
    };
    
    // Step 3
    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            return console.log(err);
        }
        return console.log('Email sent!!!');
    });
}

module.exports = {
    register,
    login,
    verifyEmail,
    getVerifyEmail
}