const db = require("../config/db");

const Project = {
    // Lấy danh sách dự án mà user đang tham gia (GIỮ NGUYÊN)
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

    // Tạo dự án mới (Viết lại bằng Callback để chống sập)
    createProject: (name, description, userId, callback) => {
        // Dùng getConnection để bắt đầu Transaction an toàn
        db.getConnection((err, connection) => {
            if (err) return callback(err, null);

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return callback(err, null);
                }

                // 1. Tạo project (Nếu CSDL của bạn không có cột description thì xóa bỏ chữ description đi nhé)
                // Giả định Database của bạn CÓ cột description:
                const insertProjectSql = 'INSERT INTO projects (name, description) VALUES (?, ?)';
                const projectValues = [name, description];
                
                // NẾU DATABASE CHỈ CÓ TÊN, DÙNG DÒNG NÀY THAY THẾ:
                // const insertProjectSql = 'INSERT INTO projects (name) VALUES (?)';
                // const projectValues = [name];

                connection.query(insertProjectSql, projectValues, (err, projectResult) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err, null);
                        });
                    }

                    const projectId = projectResult.insertId;

                    // 2. Thêm user vào bảng member với quyền Leader
                    const insertMemberSql = 'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)';
                    connection.query(insertMemberSql, [projectId, userId, 'Leader'], (err, memberResult) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err, null);
                            });
                        }

                        // 3. Hoàn tất Transaction
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(err, null);
                                });
                            }
connection.release(); // Trả kết nối lại cho pool
                            callback(null, { project_id: projectId, name, description, role: 'Leader' });
                        });
                    });
                });
            });
        });
    }
};

module.exports = Project;