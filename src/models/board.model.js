const db = require("../config/db");

const Board = {
    getAll: (callback) => {
        const sql = "SELECT * FROM board";
        db.query(sql, callback);
    },

    getById: (id, callback) => {
        const sql = "SELECT * FROM board WHERE board_id = ?";
        db.query(sql, [id], callback);
    },

    create: (user_id, name, callback) => {
        const sql = "INSERT INTO board (user_id, name) VALUES (?, ?)";
        db.query(sql, [user_id, name], callback);
    },
    
    update: (id, name, callback) => {
    const sql = "UPDATE board SET name = ? WHERE board_id = ?";
    db.query(sql, [name, id], callback);
    },

    update: (id, name, callback) => {
        const sql = "UPDATE board SET name = ? WHERE board_id = ?";
        db.query(sql, [name, id], callback);
    },

    delete: (id, callback) => {
        const sql = "DELETE FROM board WHERE board_id = ?";
        db.query(sql, [id], callback);
    }
};

module.exports = Board;