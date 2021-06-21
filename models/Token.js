const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/database');

const Token = db.define('Token',{
    id_user:{
        type: DataTypes.INTEGER,     
    },
    token:{
        type: DataTypes.STRING,     
    },
    createdAt:{
        type: DataTypes.DATE,
    }
},{
    timestamps:true,
    updatedAt: false,
    tableName: 'Token'
});

module.exports = Token;