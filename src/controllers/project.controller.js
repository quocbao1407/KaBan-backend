const Project = require("../models/project.model");

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

exports.createProject = (req, res) => {
    const { name } = req.body;
    const userId = req.user_id;

    if (!name || name.trim() === "") {
        return res.status(400).json({ success: false, message: "Tên dự án không được để trống!" });
    }

    Project.createProject(name.trim(), userId, (err, result) => {
        if (err) {
            console.error("Lỗi tạo dự án:", err);
            return res.status(500).json({ success: false, message: "Lỗi database khi tạo dự án" });
        }
        res.status(201).json({ success: true, message: "Tạo dự án thành công", data: result });
    });
};