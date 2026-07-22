const db = require("../config/db");

const Project = {
    // 1. Lấy danh sách dự án
    getProjectsByUser: (userId, callback) => {
        const sql = `
            SELECT p.project_id, p.name, p.created_at, pm.role 
            FROM Projects p
            JOIN Project_Members pm ON p.project_id = pm.project_id
            WHERE pm.user_id = ?
            ORDER BY p.created_at DESC
        `;
        db.query(sql, [userId], callback);
    },
    
    getProjectById: (projectId, userId, callback) => {
        const checkMemberSql = `SELECT role FROM Project_Members WHERE project_id = ? AND user_id = ?`;
        db.query(checkMemberSql, [projectId, userId], (err, memberRes) => {
            if (err) return callback(err, null);
            if (memberRes.length === 0) {
                return callback(new Error("Unauthorized"), null);
            }

            const projectSql = `SELECT * FROM Projects WHERE project_id = ?`;
            db.query(projectSql, [projectId], (err, projectRes) => {
                if (err) return callback(err, null);
                if (projectRes.length === 0) return callback(new Error("NotFound"), null);

                const tasksSql = `SELECT * FROM task WHERE project_id = ?`;
                db.query(tasksSql, [projectId], (err, tasksRes) => {
                    if (err) return callback(err, null);

                    const membersSql = `
                        SELECT u.id AS user_id, u.email, pm.role 
                        FROM Project_Members pm 
                        JOIN users u ON pm.user_id = u.id 
                        WHERE pm.project_id = ?
                    `;
                    db.query(membersSql, [projectId], (err, membersRes) => {
                        if (err) return callback(err, null);

                        callback(null, {
                            project: projectRes[0],
                            tasks: tasksRes,
                            members: membersRes
                        });
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

            // Bước 1: Thêm dự án vào bảng Projects
            const insertProjectSql = 'INSERT INTO Projects (name, description) VALUES (?, ?)';
            db.query(insertProjectSql, [name, description], (err, projectResult) => {
                if (err) {
                    return db.rollback(() => callback(err, null));
                }

                const projectId = projectResult.insertId;

                // Bước 2: Thêm User vào bảng Project_Members với quyền Leader
                const insertMemberSql = 'INSERT INTO Project_Members (project_id, user_id, role) VALUES (?, ?, ?)';
                db.query(insertMemberSql, [projectId, userId, 'Leader'], (err, memberResult) => {
                    if (err) {
                        return db.rollback(() => callback(err, null));
                    }
                    // Bước 3: Hoàn tất Transaction (Đã tách db.commit xuống dòng mới để tránh lỗi cú pháp)
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