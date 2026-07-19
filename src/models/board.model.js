const db = require("../config/db");

const Board = {
    // 1. Chỉ lấy danh sách bảng CỦA ĐÚNG USER ĐÓ
    getAll: (userId, callback) => {
        const sql = "SELECT * FROM board WHERE user_id = ?";
        db.query(sql, [userId], callback);
    },

    // 2. Tìm bảng theo ID cũng phải kèm điều kiện đúng user
    getById: (id, userId, callback) => {
        const sql = "SELECT * FROM board WHERE board_id = ? AND user_id = ?";
        db.query(sql, [id, userId], callback);
    },

    // 3. Tạo bảng mới (Gắn liền với ID của người tạo)
    create: (userId, name, callback) => {
        const sql = "INSERT INTO board (user_id, name) VALUES (?, ?)";
        db.query(sql, [userId, name], callback);
    },
    
    // 4. Cập nhật bảng (Khóa bảo vệ 2 lớp: đúng ID bảng VÀ đúng ID user)
    // (Đã xóa bớt một hàm update bị trùng ở code cũ)
    update: (id, userId, name, callback) => {
        const sql = "UPDATE board SET name = ? WHERE board_id = ? AND user_id = ?";
        db.query(sql, [name, id, userId], callback);
    },

    // 5. Xóa bảng (Chỉ được xóa bảng của chính mình)
    delete: (id, userId, callback) => {
        const sql = "DELETE FROM board WHERE board_id = ? AND user_id = ?";
        db.query(sql, [id, userId], callback);
    }
};

module.exports = Board;