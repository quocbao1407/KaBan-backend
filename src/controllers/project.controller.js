const Project = require("../models/project.model");

// 1. Hàm lấy danh sách dự án của người dùng
exports.getAllProjects = (req, res) => {
    const userId = req.user_id;

    Project.getProjectsByUser(userId, (err, results) => {
        if (err) {
            console.error("Lỗi lấy danh sách dự án:", err);
            return res.status(500).json({ success: false, message: "Lỗi database" });
        }
        return res.json({ success: true, data: results });
    });
};

// 2. Hàm tạo dự án mới
exports.createProject = (req, res) => {
    const { name, description } = req.body;
    const userId = req.user_id; 

    if (!name || name.trim() === "") {
        return res.status(400).json({ success: false, message: 'Tên dự án không được để trống!' });
    }

    Project.createProject(name.trim(), description, userId, (err, data) => {
        if (err) {
            console.error("Lỗi Database khi tạo dự án:", err);
            return res.status(500).json({ 
                success: false, 
                message: 'Lỗi máy chủ khi tạo dự án!',
                errorDetail: err.message 
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Tạo dự án thành công!',
            data: data
        });
    });
};

// 3. Hàm lấy chi tiết dự án (bao gồm task & members)
exports.getProjectDetail = (req, res) => {
    const projectId = req.params.projectId;
    const userId = req.user_id;

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

// 4. Hàm thêm thành viên vào dự án qua email
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

// 5. Hàm xóa dự án
exports.deleteProject = (req, res) => {
    const projectId = req.params.projectId || req.params.id;
    const userId = req.user_id;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Thiếu thông tin xác thực Token!" });
    }

    Project.deleteProject(projectId, userId, (err, result) => {
        if (err) {
            if (err.message === "Unauthorized") {
                return res.status(403).json({ 
                    success: false, 
                    message: "Chỉ Trưởng dự án (Leader) mới được phép xóa dự án này!" 
                });
            }
            console.error("Lỗi xóa dự án SQL:", err);
            return res.status(500).json({ 
                success: false, 
                message: `Lỗi CSDL khi xóa dự án: ${err.sqlMessage || err.message}` 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Đã xóa dự án thành công!" 
        });
    });
};

// 6. Hàm xóa thành viên khỏi dự án
exports.removeMember = (req, res) => {
    const { projectId, memberId } = req.params;
    const requestUserId = req.user_id;

    Project.removeMember(projectId, memberId, requestUserId, (err, result) => {
        if (err) {
            if (err.message === "Unauthorized") {
                return res.status(403).json({ success: false, message: "Chỉ Trưởng dự án mới có quyền xóa thành viên!" });
            }
            if (err.message === "CannotRemoveSelf") {
                return res.status(400).json({ success: false, message: "Bạn không thể tự xóa chính mình khỏi dự án!" });
            }
            console.error("Lỗi xóa thành viên:", err);
            return res.status(500).json({ success: false, message: "Lỗi máy chủ khi xóa thành viên!" });
        }

        return res.status(200).json({
            success: true,
            message: "Đã xóa thành viên khỏi dự án thành công!"
        });
    });
};