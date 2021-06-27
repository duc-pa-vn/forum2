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
    active:{
        type: DataTypes.BOOLEAN,
    },
    create_at:{
        type: DataTypes.DATE,
    },
    avatar: {
        type: DataTypes.STRING
    }
},{
    timestamps:true,
    createdAt: 'create_at',
    updatedAt: false,
    tableName: 'User'
});

module.exports = User;