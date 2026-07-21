const db = require("../config/db");

const Project = {
    // Lấy danh sách dự án mà user đang tham gia
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

    // Tạo dự án mới (Dùng Transaction để tạo Project + Thêm user làm Leader)
    createProject: async (name, userId, callback) => {
        const connection = await db.promise().getConnection();
        try {
            await connection.beginTransaction();

            // 1. Tạo project
            const [projectResult] = await connection.query('INSERT INTO projects (name) VALUES (?)', [name]);
            const projectId = projectResult.insertId;

            // 2. Thêm user vào bảng member với quyền Leader
            await connection.query(
                'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
                [projectId, userId, 'Leader']
            );

            await connection.commit();
            callback(null, { project_id: projectId, name, role: 'Leader' });
        } catch (error) {
            await connection.rollback();
            callback(error, null);
        } finally {
            connection.release();
        }
    }
};

module.exports = Project;