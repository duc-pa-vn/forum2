const express = require('express');
const Router = express.Router();
const userCtrl = require('../controllers/userCtrl');
const multer = require('multer');
const s3 = require('../common/s3');
var upload = multer({dest: './public/images/avatar/'});

Router.get('/login', (req,res) => {
    res.render('login');
});

Router.get('/register', (req,res) => {
    res.render('register');
});

Router.post('/login', userCtrl.login);

// Router.post('/register', upload.single('avatar'), s3.upload, userCtrl.register);

Router.get('/verify/:token', userCtrl.verifyEmail);

Router.post('/changePassword',userCtrl.changePassword);

// Router.get('/logout', userCtrl.logout);

Router.post('/test', upload.single('avatar'), async (req, res) => {
    try{
        const file = req.file
        console.log(file)
        const result = await s3.uploadFile(file)
        console.log(result)
        res.send('ok')
    }
    catch(err){
        console.log(err)
    }
})

module.exports = Router;