const User = require('../models/User');
const Token_tb = require('../models/Token');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const create_res = require('../common/create_res')
const s3 = require('../common/s3')
const uploadS = require('../services/upload')

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
        active: false,
        avatar: null
    }
    User.create(user)
    .then(user => {
        getVerifyEmail(user.nickname,  user.email, "signup");
        let mess = {
            mess: 'add successfully. An email sent. Verify email to active'
        }
        res.send(create_res.sendSuccess(mess))
    })
    .catch(err => {
        console.log(err);
        res.send(create_res.sendError())
    })
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
                    console.log(err)
                    return res.send(create_res.sendError())
                }
                if(suc){
                    if(user.active === false){
                        getVerifyEmail(user.nickname, user.email, "signup");
                        let mess = {
                            mess: "An email sent. Active your account"
                        }
                        // mess = JSON.stringify(mess);
                        res.send(create_res.sendSuccess(mess));
                    }else{
                        // let refresh_token = jwt.sign({nickname}, process.env.REFRESH_TOKEN, {expiresIn: '20h'});
                        let token = jwt.sign({nickname, avatar: user.avatar}, process.env.LOGIN_TOKEN, {expiresIn: '17h'});
                        token = {
                            token
                        }
                        res.send(create_res.sendSuccess(token))
                    }   
                }
                else{
                    let mess = {
                        mess: "wrong password"
                    }
                    res.send(create_res.sendSuccess(mess));
                }
            })
        }
        else{
            let mess = {
                mess: 'nickname doesn\'t exist'
            }
            res.send(create_res.sendSuccess(mess));
        }
    }).catch(err => {
        console.log(err)
        res.send(create_res.sendError())
    })
}

const verifyEmail = (req, res) => {
    let token = req.params.token;
    jwt.verify(token, process.env.SIGN_UP_TOKEN, (err, user) => {
        if(err) {
            console.log(err)
            res.send(create_res.sendError())
        }
        else{
            User.update({active: true},{
                where: {
                    nickname: user.nickname
                }
            }).then(() => {
                let mess = {
                    mess: 'active'
                }
                res.send(create_res.sendSuccess(mess))
            }).catch(err => {
                console.log(err)
                res.send(create_res.sendError())
            })
        } 
    });
}

const checkRecoverToken = (req, res) => {
    let token = req.params.token;
    jwt.verify(token, process.env.RECOVER_TOKEN, (err, user) => {
        if(err) {
            console.log(err)
            res.send(create_res.sendError())
        }
        else{
            let mess = {
                nickname: user.nickname,
                mess: 'redirect to recover page'
            }
            res.send(create_res.sendSuccess(mess))
        } 
    });
}

function getVerifyEmail(nickname, email, type) {
    let html;
    let token;
    if(type === "signup"){
        token = jwt.sign({nickname}, process.env.SIGN_UP_TOKEN, {expiresIn: '17m'});
        html = `<p>click this link to confirm your email:</p><a href="http://localhost:6969/user/verify/${token}">click here</a>`;
    } 
    else if( type === "recover"){
        token = jwt.sign({nickname}, process.env.RECOVER_TOKEN, {expiresIn: '17m'});
        html = `<p>click this link to change password:</p><a href="http://localhost:6969/user/recover/${token}">click here</a>`;
    } 
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL , // TODO: your gmail account
            pass: process.env.EPW  // TODO: your gmail password
        }
    });
    
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

const forgotPassword = (req, res) => {
    const nickname = req.body.nickname;
    User.findOne({
        where: {
            nickname
        }
    }).then(user => {
        if(user){
            getVerifyEmail(user.nickname, user.email, "recover");
            let mess ={
                mess: "a link to recover your password sent."
            }
            res.send(create_res.sendSuccess(mess))
        }
        else{
            let mess ={
                mess: "nickname doesn\'t exist"
            }
            res.send(create_res.sendSuccess(mess))
        }
    }).catch(err => {
        console.log(err)
        res.send(create_res.sendError())
    })
}

const recoverPassword = async (req, res) => {
    try{
        var hash_password = await bcrypt.hash(req.body.password.toString().trim(), 10);
        var nickname = req.body.nickname;
    }
    catch(err){
        console.log(err)
        res.send(create_res.sendError())
    }

    User.update({hash_password},{
        where: {
            nickname
        }
    }).then(() => {
        let mess ={
            mess: "recover successfully"
        }
        res.send(create_res.sendSuccess(mess))
    }).catch(err => {
        console.log(err)
        res.send(create_res.sendError())
    })
}

const changeAvatar = async (req, res) => {
    try{
        let nameFile = await uploadS.uploadImage(req, res, 'avatar');
        if (nameFile) {
            const file = req.file;
            console.log(file);
            const result = await s3.uploadFile(file);
            console.log(result);
            let avatar = result.key;
            let nickname = req.body.nickname;
            User.update({avatar},{
                where: {
                    nickname
                }
            })
            let mess = {
                mess: 'avatar was updated'
            }
            res.send(create_res.sendSuccess(mess))
        }
        else{
            res.send(create_res.sendError())
        }
    }
    catch(err){
        console.log(err);
        return;
    }
}

module.exports = {
    register,
    login,
    verifyEmail,
    getVerifyEmail,
    forgotPassword,
    checkRecoverToken,
    recoverPassword,
    changeAvatar
}