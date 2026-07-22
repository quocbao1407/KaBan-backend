const ProjectTask = require('../models/projectTask.model');

// Lấy danh sách task của project
exports.getProjectTasks = (req, res) => {
    const projectId = req.params.projectId;
    ProjectTask.getTasksByProject(projectId, (err, tasks) => {
        if (err) {
            console.error("Lỗi lấy task dự án:", err);
            return res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
        return res.status(200).json({ success: true, tasks });
    });
};

// Tạo task mới trong project
exports.createProjectTask = (req, res) => {
    const projectId = req.params.projectId;
    const userId = req.user_id; // Từ middleware xác thực
    const taskData = req.body;

    if (!taskData.title) {
        return res.status(400).json({ success: false, message: "Tiêu đề công việc là bắt buộc!" });
    }

    ProjectTask.createTask(projectId, userId, taskData, (err, result) => {
        if (err) {
            if (err.message === "Unauthorized") {
                return res.status(403).json({ success: false, message: "Bạn không có quyền thêm công việc vào dự án này!" });
            }
            console.error("Lỗi tạo task dự án:", err);
            return res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }

        return res.status(201).json({
            success: true,
            message: "Tạo công việc thành công!",
            task_id: result.insertId
        });
    });
};

// Cập nhật thông tin hoặc trạng thái task
exports.updateTask = (req, res) => {
    const taskId = req.params.taskId;
    const taskData = req.body;

    ProjectTask.updateTask(taskId, taskData, (err, result) => {
        if (err) {
            console.error("Lỗi cập nhật task:", err);
            return res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
        return res.status(200).json({ success: true, message: "Cập nhật công việc thành công!" });
    });
};