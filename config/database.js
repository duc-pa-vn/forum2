const { Sequelize } = require('sequelize');

module.exports = new Sequelize('forum', 'root', 'sister2002', {
  host: 'localhost',
  dialect: 'mysql'
});

