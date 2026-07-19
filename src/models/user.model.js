const db = require("../config/db");

const User = {
  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], callback);
  },

  create: (email, password, callback) => {
    const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
    db.query(sql, [email, password], callback);
  }
};

module.exports = User;