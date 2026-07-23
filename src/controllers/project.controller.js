const Project = require("../models/project.model");

// Hàm lấy danh sách dự án
exports.getAllProjects = (req, res) => {
    const userId = req.user_id;

    Project.getProjectsByUser(userId, (err, results) => {
        if (err) {
            console.error("Lỗi lấy danh sách dự án:", err);
            return res.status(500).json({ success: false, message: "Lỗi database" });
        }
        res.json({ success: true, data: results });
    });
};

// Hàm tạo dự án mới
exports.createProject = (req, res) => {
    console.log("🚨 ĐÃ LỌT VÀO CONTROLLER. Dữ liệu nhận được:", req.body, "User ID:", req.user_id);
    // 1. Lấy dữ liệu từ Frontend gửi lên (cả name và description)
    const { name, description } = req.body;
    
    // 2. Lấy userId từ token (đã được middleware auth gắn vào req)
    const userId = req.user_id; 

    // Kiểm tra dữ liệu đầu vào
    if (!name || name.trim() === "") {
        return res.status(400).json({ success: false, message: 'Tên dự án không được để trống!' });
    }

    // 3. Gọi Model (Truyền đủ 4 tham số: name, description, userId, callback)
    Project.createProject(name.trim(), description, userId, (err, data) => {
        if (err) {
            console.error("Lỗi Database khi tạo dự án:", err);
            // Trả về JSON lỗi chi tiết
            return res.status(500).json({ 
                success: false, 
                message: 'Lỗi máy chủ khi tạo dự án!',
                errorDetail: err.message 
            });
        }

        // 4. Thành công
        return res.status(201).json({
            success: true,
            message: 'Tạo dự án thành công!',
            data: data
        });
    });
};

exports.getProjectDetail = (req, res) => {
    const projectId = req.params.projectId;
    const userId = req.user_id; // Đã được middleware xác thực token gắn vào

    Project.getProjectById(projectId, userId, (err, data) => {
        if (err) {
            if (err.message === "Unauthorized") {
                return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập dự án này!" });
            }
            if (err.message === "NotFound") {
                return res.status(404).json({ success: false, message: "Không tìm thấy dự án!" });
            }
            console.error("Lỗi lấy chi tiết dự án:", err);
            return res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }

        return res.status(200).json({
            success: true,
            project: data.project,
            tasks: data.tasks,
            members: data.members
        });
    });
};

exports.addMember = (req, res) => {
    const projectId = req.params.projectId;
    const { email, role } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email thành viên là bắt buộc!" });
    }

    Project.addMemberToProject(projectId, email, role, (err, result) => {
        if (err) {
            if (err.message === "UserNotFound") {
                return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản với email này trong hệ thống!" });
            }
            if (err.message === "AlreadyMember") {
                return res.status(400).json({ success: false, message: "Thành viên này đã có trong dự án rồi!" });
            }
            console.error("Lỗi thêm thành viên:", err);
            return res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }

        return res.status(201).json({
            success: true,
            message: "Thêm thành viên vào dự án thành công!"
        });
    });
};

// Thêm hàm deleteProject vào project.controller.js
exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user_id;

  try {
    // Kiểm tra xem user có phải Leader dự án không
    const [members] = await db.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [id, userId]
    );

    if (members.length === 0 || members[0].role !== 'leader') {
      return res.status(403).json({ message: 'Chỉ Trưởng dự án (Leader) mới được phép xóa dự án này!' });
    }

    // Xóa tất cả tasks liên quan trước
    await db.query('DELETE FROM tasks WHERE project_id = ?', [id]);
    // Xóa tất cả thành viên trong dự án
    await db.query('DELETE FROM project_members WHERE project_id = ?', [id]);
    // Xóa dự án
    await db.query('DELETE FROM projects WHERE project_id = ?', [id]);

    return res.json({ message: 'Đã xóa dự án thành công!' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi xóa dự án!', error: error.message });
  }
};