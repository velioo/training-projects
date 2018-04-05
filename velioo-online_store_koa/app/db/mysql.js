const CONSTANTS = require('../constants/constants');

const mysql = require('promise-mysql');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'online_store',
  connectionLimit: CONSTANTS.CONNECTION_LIMIT
});

module.exports = {
  pool: pool
};
