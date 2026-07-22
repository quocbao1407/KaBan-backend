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