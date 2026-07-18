require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        minVersion: "TLSv1.2"
    }
});

connection.connect((err) => {
    if (err) {
        console.error("Database connection failed");
        console.error(err);
        return;
    }

    console.log("TiDB Connected!");
});

module.exports = connection;