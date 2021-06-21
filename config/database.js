const { Sequelize } = require('sequelize');
require('dotenv').config();

module.exports = new Sequelize('forum', 'root', process.env.DB_PW, {
  host: 'localhost',
  dialect: 'mysql'
});

