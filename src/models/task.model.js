const db = require("../config/db");

const Task = {
    // 1. Lấy danh sách task (Có phân biệt task cá nhân và task dự án)
    getAllTasks: (userId, projectId, callback) => {
        let sql = '';
        let params = [];

        if (projectId === null) {
            // Lấy task cá nhân (không thuộc dự án nào)
            sql = "SELECT * FROM task WHERE user_id = ? AND project_id IS NULL ORDER BY created_at DESC";
            params = [userId];
        } else {
            // Lấy task của một dự án cụ thể
            sql = "SELECT * FROM task WHERE project_id = ? ORDER BY created_at DESC";
            params = [projectId];
        }

        db.query(sql, params, callback);
    },

    // 2. Tìm chi tiết 1 task (phải khớp cả ID task VÀ ID user)
    getTaskById: (taskId, userId, callback) => {
        const sql = "SELECT * FROM task WHERE task_id = ? AND user_id = ?";
        db.query(sql, [taskId, userId], callback);
    },

    // 3. Tạo task mới (Đã xóa board_id, thêm priority, project_id, assigned_to)
    createTask: (taskData, callback) => {
        const sql = "INSERT INTO task (title, description, status, deadline, priority, project_id, assigned_to, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(sql, [
            taskData.title, 
            taskData.description, 
            taskData.status, 
            taskData.deadline, 
            taskData.priority,
            taskData.project_id,
            taskData.assigned_to,
            taskData.user_id // Ghi nhận người tạo
        ], callback);
    },

    // 4. Cập nhật task (Thêm các trường mới vào câu lệnh SET)
    updateTask: (taskId, userId, taskData, callback) => {
        const sql = "UPDATE task SET title=?, description=?, status=?, deadline=?, priority=?, project_id=?, assigned_to=? WHERE task_id=? AND user_id=?";
        db.query(sql, [
            taskData.title, 
            taskData.description, 
            taskData.status, 
            taskData.deadline, 
            taskData.priority,
            taskData.project_id,
            taskData.assigned_to,
            taskId, 
            userId // Khóa bảo vệ 2 lớp
        ], callback);
    },

    // 5. Xóa task (Chỉ xóa khi đúng user_id)
    deleteTask: (taskId, userId, callback) => {
        const sql = "DELETE FROM task WHERE task_id = ? AND user_id = ?";
        db.query(sql, [taskId, userId], callback);
    }
};

module.exports = Task;