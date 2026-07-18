const Task = require("../models/task.model");

// GET /api/tasks
exports.getAllTasks = (req, res) => {
    Task.getAllTasks((err, results) => {
        if (err) {
            console.error("Lỗi lấy danh sách task:", err);
            return res.status(500).json({
                success: false,
                message: "Lỗi database"
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};


// GET /api/tasks/:id
exports.getTaskById = (req, res) => {
    const { id } = req.params;

    Task.getTaskById(id, (err, results) => {
        if (err) {
            console.error("Lỗi lấy task:", err);
            return res.status(500).json({
                success: false,
                message: "Lỗi database"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy task"
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
};


// POST /api/tasks
exports.createTask = (req, res) => {
    const { title, description, status, deadline, board_id } = req.body;

    // Validate title
    if (!title || title.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Tiêu đề task không được để trống!"
        });
    }

    // Validate board
    if (!board_id) {
        return res.status(400).json({
            success: false,
            message: "board_id là bắt buộc!"
        });
    }

    const taskData = {
        title: title.trim(),
        description: description || null,
        status: status || "To Do",
        // Chuyển chuỗi deadline thành object Date để MySQL dễ lưu, nếu không có thì null
        deadline: deadline ? new Date(deadline) : null, 
        board_id
    };

    Task.createTask(taskData, (err, results) => {
        if (err) {
            console.error("Lỗi tạo task:", err);
            return res.status(500).json({
                success: false,
                message: "Lỗi database"
            });
        }

        res.status(201).json({
            success: true,
            message: "Tạo task thành công!",
            data: {
                task_id: results.insertId,
                ...taskData
            }
        });
    });
};


// PUT /api/tasks/:id
exports.updateTask = (req, res) => {
    const { id } = req.params;
    const { title, description, status, deadline } = req.body;

    // BƯỚC 1: Lấy dữ liệu CŨ của task lên trước để bảo toàn thông tin
    Task.getTaskById(id, (err, results) => {
        if (err) {
            console.error("Lỗi lấy task để update:", err);
            return res.status(500).json({ success: false, message: "Lỗi database" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy task" });
        }

        const oldTask = results[0];

        // BƯỚC 2: Gom dữ liệu (Nếu FE có gửi thì xài data mới, nếu gửi thiếu thì xài data cũ)
        const taskData = {
            title: title !== undefined ? title : oldTask.title,
            description: description !== undefined ? description : oldTask.description,
            status: status !== undefined ? status : oldTask.status,
            // Xử lý ngày tháng: Convert sang Date để tránh lỗi ISO string
            deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : oldTask.deadline
        };

        // BƯỚC 3: Cập nhật xuống DB bằng dữ liệu đã hoàn thiện
        Task.updateTask(id, taskData, (updateErr, updateResults) => {
            if (updateErr) {
                console.error("Lỗi update task:", updateErr);
                return res.status(500).json({ success: false, message: "Lỗi database" });
            }

            res.json({
                success: true,
                message: "Cập nhật task thành công!"
            });
        });
    });
};


// DELETE /api/tasks/:id
exports.deleteTask = (req, res) => {
    const { id } = req.params;

    Task.deleteTask(id, (err, results) => {
        if (err) {
            console.error("Lỗi xóa task:", err);
            return res.status(500).json({
                success: false,
                message: "Lỗi database"
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy task"
            });
        }

        res.json({
            success: true,
            message: "Xóa task thành công!"
        });
    });
};
