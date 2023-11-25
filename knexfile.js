require('dotenv').config();

module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootroot',
    database: process.env.DB_DATABASE || 'medminder'
  },
};
