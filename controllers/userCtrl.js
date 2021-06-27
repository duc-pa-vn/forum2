const User = require('../models/User');
const Token_tb = require('../models/Token');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const create_res = require('../common/create_res')
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
        avatar: req.body.key
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
        res.send(create_res.sendError(500,mess.errorCodes.INTERNAL_SERVER_ERROR,err))
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
                        let token = jwt.sign({nickname}, process.env.LOGIN_TOKEN, {expiresIn: '17h'});
                        token = {
                            token
                        }
                        res.send(create_res.sendSuccess(token))
                        // let id_user = user.id;
                        // let token_item = {
                        //     id_user,
                        //     token
                        // }
                        // Token_tb.findOne({
                        //     where: {
                        //         id_user
                        //     }
                        // }).then(user_token => {
                        //     if(user_token){
                        //         Token_tb.update({token: refresh_token},{
                        //             where: {
                        //                 id_user
                        //             }
                        //         })
                        //     }
                        //     else{
                        //         Token_tb.create(token_item)
                        //         .then(
                        //             res.json({
                        //                 token,
                        //                 refresh_token
                        //             })
                        //         ).catch(err => {
                        //             res.json({err})
                        //         })
                        //     }
                        // })
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

// const logout = (req, res) =>{
//     let refresh_token = req.body.refresh_token;
//     jwt.verify(refresh_token, process.env.REFRESH_TOKEN, (err, user) => {
//         if(err) {
//             res.json({err})
//         }
//         else{
//             User.findOne({
//                 where: {
//                     nickname: user.nickname
//                 }
//             }).then(user_item => {
//                 if(user_item){
//                     Token_tb.destroy({
//                         where: {
//                             id_user: user_item.id
//                         }
//                     })
//                 }
//                 res.sendStatus(204) 
//             }).catch(err => {
//                 res.json({err})
//             })
//         }
//     })
// }

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

module.exports = {
    register,
    login,
    verifyEmail,
    getVerifyEmail,
    forgotPassword,
    checkRecoverToken,
    recoverPassword
}