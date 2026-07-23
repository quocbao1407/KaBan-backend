const db = require("../config/db");

const Project = {
    // 1. Lấy danh sách dự án (Đã bổ sung p.description và lấy tên Trưởng dự án - Leader)
    getProjectsByUser: (userId, callback) => {
        const sql = `
            SELECT 
                p.project_id, 
                p.name, 
                p.description, 
                p.created_at, 
                pm.role,
                (
                    SELECT u.name 
                    FROM Project_Members pm2 
                    JOIN Users u ON pm2.user_id = u.id 
                    WHERE pm2.project_id = p.project_id AND LOWER(pm2.role) = 'leader' 
                    LIMIT 1
                ) AS creator_name
            FROM Projects p
            JOIN Project_Members pm ON p.project_id = pm.project_id
            WHERE pm.user_id = ?
            ORDER BY p.created_at DESC
        `;
        db.query(sql, [userId], callback);
    },
    
    // 2. Lấy chi tiết dự án (kèm thông tin thành viên có u.name và u.email)
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
                        SELECT u.id AS user_id, u.name, u.email, pm.role 
                        FROM Project_Members pm 
                        JOIN Users u ON pm.user_id = u.id 
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

    // 3. Tạo dự án mới
    createProject: (name, description, userId, callback) => {
        db.beginTransaction((err) => {
            if (err) return callback(err, null);

            const insertProjectSql = 'INSERT INTO Projects (name, description) VALUES (?, ?)';
            db.query(insertProjectSql, [name, description], (err, projectResult) => {
                if (err) {
                    return db.rollback(() => callback(err, null));
                }

                const projectId = projectResult.insertId;
                const insertMemberSql = 'INSERT INTO Project_Members (project_id, user_id, role) VALUES (?, ?, ?)';
                
                db.query(insertMemberSql, [projectId, userId, 'Leader'], (err, memberResult) => {
                    if (err) {
                        return db.rollback(() => callback(err, null));
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => callback(err, null));
                        }
                        
                        callback(null, { project_id: projectId, name, description, role: 'Leader' });
                    });
                });
            });
        });
    },

    // 4. Thêm thành viên vào dự án bằng email
    addMemberToProject: (projectId, email, role, callback) => {
        const findUserSql = "SELECT id FROM Users WHERE email = ?";
        db.query(findUserSql, [email], (err, userRes) => {
            if (err) return callback(err, null);
            if (userRes.length === 0) {
                return callback(new Error("UserNotFound"), null);
            }

            const userId = userRes[0].id;

            const checkExistSql = "SELECT * FROM Project_Members WHERE project_id = ? AND user_id = ?";
            db.query(checkExistSql, [projectId, userId], (err, existRes) => {
                if (err) return callback(err, null);
                if (existRes.length > 0) {
                    return callback(new Error("AlreadyMember"), null);
                }

                const insertSql = "INSERT INTO Project_Members (project_id, user_id, role) VALUES (?, ?, ?)";
                db.query(insertSql, [projectId, userId, role || 'Member'], callback);
            });
        });
    }
};

// Thay thế hàm deleteProject trong src/models/project.model.js

deleteProject: (projectId, userId, callback) => {
    // 1. Kiểm tra xem người dùng có phải Leader của dự án không
    const checkLeaderSql = "SELECT role FROM Project_Members WHERE project_id = ? AND user_id = ?";
    
    db.query(checkLeaderSql, [projectId, userId], (err, members) => {
        if (err) {
            console.error("Lỗi kiểm tra quyền Leader:", err);
            return callback(err, null);
        }

        if (!members || members.length === 0 || (members[0].role || '').toLowerCase() !== 'leader') {
            return callback(new Error("Unauthorized"), null);
        }

        // 2. Tắt kiểm tra khóa ngoại tạm thời để xóa liên hoàn không bị vướng FK Constraint
        db.query("SET FOREIGN_KEY_CHECKS = 0", (err) => {
            if (err) console.error("Lỗi tắt FK check:", err);

            // 3. Xóa toàn bộ task của dự án trong bảng 'task'
            db.query("DELETE FROM task WHERE project_id = ?", [projectId], (err) => {
                if (err) console.error("Lỗi xóa task:", err);

                // 4. Xóa toàn bộ thành viên trong bảng 'Project_Members'
                db.query("DELETE FROM Project_Members WHERE project_id = ?", [projectId], (err) => {
                    if (err) {
                        console.error("Lỗi xóa Project_Members:", err);
                        db.query("SET FOREIGN_KEY_CHECKS = 1");
                        return callback(err, null);
                    }

                    // 5. Xóa chính dự án trong bảng 'Projects'
                    db.query("DELETE FROM Projects WHERE project_id = ?", [projectId], (err, result) => {
                        // Luôn bật lại kiểm tra khóa ngoại
                        db.query("SET FOREIGN_KEY_CHECKS = 1");

                        if (err) {
                            console.error("Lỗi xóa Projects:", err);
                            return callback(err, null);
                        }

                        return callback(null, result);
                    });
                });
            });
        });
    });
}

module.exports = Project;