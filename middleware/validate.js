const create_res = require('../common/create_res')

const checkRepeatPassword = (req, res, next) => {
    let password = req.body.password
    let repeat = req.body.checkRepeatPassword
    if(password === repeat ) next()
    else{
        let mess = {
            mess: "password and repeat password doesn\'t match"
        }
        return res.send(create_res.sendSuccess(mess))
    }
}

module.exports = {
    checkRepeatPassword
}