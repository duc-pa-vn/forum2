const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/database');

const User = db.define('User',{
    full_name:{
        type: DataTypes.STRING,     
    },
    email:{
        type: DataTypes.STRING,     
    },
    hash_password:{
        type: DataTypes.STRING,     
    },
    nickname:{
        type: DataTypes.STRING,     
    },
    create_at:{
        type: DataTypes.DATE
    }
},{
    timestamps:true,
    createdAt: 'create_at',
    updatedAt:false
});

module.exports = User;