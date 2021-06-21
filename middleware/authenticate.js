const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    let token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.LOGIN_TOKEN, (err ,user) => {
        if(err) return res.json({err})
        req.user = user;
        next()
    })
}

module.exports = {
    authenticate
}