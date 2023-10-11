require('dotenv').config()
let mysql = require('mysql2/promise');

var conn = mysql.createPool({
    host: process.env.CHAT_HOST,
    user: process.env.CHAT_USER,
    password: process.env.CHAT_PASSWORD,
    database: process.env.CHAT_DATABASE,
    port: 3306,
    multipleStatements:true,
});

module.exports = conn
