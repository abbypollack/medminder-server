const Sequelize = require('sequelize');
const config = require('../config/config').development;
const sequelize = new Sequelize(config.database, config.username, config.password, config);

const User = require('./user')(sequelize);


sequelize.sync({ force: false }) 
  .then(() => {
    console.log('Database & tables created!');
  });

module.exports = {
  sequelize,
  User,
};
