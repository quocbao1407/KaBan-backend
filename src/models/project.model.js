const db = require("../config/db");

const Project = {
    // 1. Lấy danh sách dự án
    getProjectsByUser: (userId, callback) => {
        const sql = `
            SELECT p.project_id, p.name, p.created_at, pm.role 
            FROM projects p
            JOIN project_members pm ON p.project_id = pm.project_id
            WHERE pm.user_id = ?
            ORDER BY p.created_at DESC
        `;
        db.query(sql, [userId], callback);
    },
        // Thêm hàm này vào đối tượng Project trong file src/models/project.model.js
    getProjectById: (projectId, userId, callback) => {
    // 1. Kiểm tra xem user có thuộc project này không (Phân quyền)
        const checkMemberSql = `SELECT role FROM project_members WHERE project_id = ? AND user_id = ?`;
        db.query(checkMemberSql, [projectId, userId], (err, memberRes) => {
            if (err) return callback(err, null);
            if (memberRes.length === 0) {
                return callback(new Error("Unauthorized"), null);
            }

        // 2. Lấy thông tin dự án
        const projectSql = `SELECT * FROM projects WHERE project_id = ?`;
        db.query(projectSql, [projectId], (err, projectRes) => {
            if (err) return callback(err, null);
            if (projectRes.length === 0) return callback(new Error("NotFound"), null);

            // 3. Lấy danh sách task thuộc dự án
            const tasksSql = `SELECT * FROM tasks WHERE project_id = ?`;
            db.query(tasksSql, [projectId], (err, tasksRes) => {
                if (err) return callback(err, null);

                callback(null, {
                    project: projectRes[0],
                    tasks: tasksRes
                });
            });
        });
    });
},  

    // 2. Tạo dự án mới (Đã sửa lại cho phù hợp với kết nối đơn của bạn)
    createProject: (name, description, userId, callback) => {
        
        // Bắt đầu Transaction trực tiếp trên biến db
        db.beginTransaction((err) => {
            if (err) return callback(err, null);

            // Bước 1: Thêm dự án vào bảng projects
            const insertProjectSql = 'INSERT INTO projects (name, description) VALUES (?, ?)';
            db.query(insertProjectSql, [name, description], (err, projectResult) => {
                if (err) {
                    return db.rollback(() => callback(err, null));
                }

                const projectId = projectResult.insertId;

                // Bước 2: Thêm User vào bảng project_members với quyền Leader
                const insertMemberSql = 'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)';
                db.query(insertMemberSql, [projectId, userId, 'Leader'], (err, memberResult) => {
                    if (err) {
                        return db.rollback(() => callback(err, null));
                    }

                    // Bước 3: Hoàn tất Transaction
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => callback(err, null));
                        }
                        
                        // Trả về dữ liệu thành công
                        callback(null, { project_id: projectId, name, description, role: 'Leader' });
                    });
                });
            });
        });
    }
};

module.exports = Project;