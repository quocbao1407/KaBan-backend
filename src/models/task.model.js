const db = require("../config/db");

const Task = {
    // 1. Chỉ lấy task CỦA USER ĐÓ
    getAllTasks: (userId, callback) => {
        const sql = "SELECT * FROM tasks WHERE user_id = ?";
        db.query(sql, [userId], callback);
    },

    // 2. Tìm chi tiết 1 task (phải khớp cả ID task VÀ ID user)
    getTaskById: (taskId, userId, callback) => {
        const sql = "SELECT * FROM tasks WHERE task_id = ? AND user_id = ?";
        db.query(sql, [taskId, userId], callback);
    },

    // 3. Tạo task mới (Lưu kèm user_id)
    createTask: (taskData, callback) => {
        const sql = "INSERT INTO tasks (title, description, status, deadline, board_id, user_id) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [
            taskData.title, 
            taskData.description, 
            taskData.status, 
            taskData.deadline, 
            taskData.board_id, 
            taskData.user_id // Ghi nhận người tạo
        ], callback);
    },

    // 4. Cập nhật task (Chỉ sửa khi đúng user_id)
    updateTask: (taskId, userId, taskData, callback) => {
        const sql = "UPDATE tasks SET title=?, description=?, status=?, deadline=? WHERE task_id=? AND user_id=?";
        db.query(sql, [
            taskData.title, 
            taskData.description, 
            taskData.status, 
            taskData.deadline, 
            taskId, 
            userId // Khóa bảo vệ 2 lớp
        ], callback);
    },

    // 5. Xóa task (Chỉ xóa khi đúng user_id)
    deleteTask: (taskId, userId, callback) => {
        const sql = "DELETE FROM tasks WHERE task_id = ? AND user_id = ?";
        db.query(sql, [taskId, userId], callback);
    }
};

module.exports = Task;