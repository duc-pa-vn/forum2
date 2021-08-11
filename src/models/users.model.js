var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
    full_name: String,
    email: String,
    nickname: String,
    password: String,
    active: Boolean,
    avatar: String
})

var Users = mongoose.model('Users', userSchema, 'users')

module.exports = Users