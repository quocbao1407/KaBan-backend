const db = require("../config/db");

const ProjectTask = {
    // 1. Lấy danh sách task của một dự án cụ thể
    getTasksByProject: (projectId, callback) => {
        const sql = "SELECT * FROM task WHERE project_id = ? ORDER BY task_id DESC";
        db.query(sql, [projectId], callback);
    },

    // 2. Lấy chi tiết 1 task theo ID
    getTaskById: (taskId, callback) => {
        const sql = "SELECT * FROM task WHERE task_id = ?";
        db.query(sql, [taskId], callback);
    },

    // 3. Tạo task mới cho dự án (Có kiểm tra quyền thành viên)
    createTask: (projectId, userId, taskData, callback) => {
        // Kiểm tra xem user có thuộc dự án này không (Leader hoặc Member)
        const checkMemberSql = `SELECT role FROM Project_Members WHERE project_id = ? AND user_id = ?`;
        db.query(checkMemberSql, [projectId, userId], (err, memberRes) => {
            if (err) return callback(err, null);
            if (memberRes.length === 0) {
                return callback(new Error("Unauthorized"), null);
            }

            const { title, description, status, deadline, priority, assigned_to } = taskData;
            
            // Đã lược bỏ các cột created_by và updated_at để khớp với bảng task cơ bản
            const sql = `
                INSERT INTO task (project_id, assigned_to, title, description, priority, status, deadline) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.query(sql, [
                projectId,
                assigned_to || userId,
                title,
                description || '',
                priority || 'Medium',
                status || 'To Do',
                deadline || null
            ], callback);
        });
    },

    // 4. Cập nhật task trong dự án
    updateTask: (taskId, taskData, callback) => {
        const { title, description, status, deadline, priority, assigned_to } = taskData;
        const sql = `
            UPDATE task 
            SET title = ?, description = ?, status = ?, deadline = ?, priority = ?, assigned_to = ? 
            WHERE task_id = ?
        `;
        db.query(sql, [
            title, 
            description, 
            status, 
            deadline, 
            priority, 
            assigned_to, 
            taskId
        ], callback);
    },

    // 5. Xóa task trong dự án
    deleteTask: (taskId, callback) => {
        const sql = "DELETE FROM task WHERE task_id = ?";
        db.query(sql, [taskId], callback);
    }
};

module.exports = ProjectTask;