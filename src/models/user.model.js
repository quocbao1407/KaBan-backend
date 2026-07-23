const db = require("../config/db");

const User = {
    // Tìm user bằng email (cho Đăng ký / Đăng nhập)
    findByEmail: (email, callback) => {
        const sql = "SELECT * FROM Users WHERE email = ?";
        db.query(sql, [email], callback);
    },

    // Tìm user bằng ID (Cho trang Cài đặt)
    findById: (id, callback) => {
        const sql = "SELECT id, name, email FROM Users WHERE id = ?";
        db.query(sql, [id], callback);
    },

    // Tạo user mới
    create: (name, email, password, callback) => {
        const sql = "INSERT INTO Users (name, email, password) VALUES (?, ?, ?)";
        db.query(sql, [name, email, password], callback);
    },

    // Cập nhật Họ và tên
    updateName: (id, name, callback) => {
        const sql = "UPDATE Users SET name = ? WHERE id = ?";
        db.query(sql, [name, id], callback);
    },

    // Cập nhật Mật khẩu
    updatePassword: (id, hashedPassword, callback) => {
        const sql = "UPDATE Users SET password = ? WHERE id = ?";
        db.query(sql, [hashedPassword, id], callback);
    }
};

module.exports = User;