// db.js
const mysql = require('mysql2');

// Create connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'link_mate'
});

// Function to execute queries easily
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
            if (error) {
                console.error("Database query error:", error);
                return reject(error);
            }
            resolve(results);
        });
    });
}

module.exports = { query };

