const Task = require("../models/task.model");

// GET /api/tasks
exports.getAllTasks = (req, res) => {
    const userId = req.user_id; // Lấy ID của người đang đăng nhập từ Token
    
    // Bổ sung: Lấy project_id từ URL query (VD: /api/tasks?project_id=null)
    const projectId = req.query.project_id; 
    const finalProjectId = (projectId === 'null' || projectId === '' || projectId === undefined) ? null : projectId;

    // Truyền thêm finalProjectId vào Model
    Task.getAllTasks(userId, finalProjectId, (err, results) => {
        if (err) {
            console.error("Lỗi lấy danh sách task:", err);
            return res.status(500).json({ success: false, message: "Lỗi database" });
        }
        res.json({ success: true, data: results });
    });
};

// GET /api/tasks/:id
exports.getTaskById = (req, res) => {
    const { id } = req.params;
    const userId = req.user_id; // Gắn thêm ID người dùng

    Task.getTaskById(id, userId, (err, results) => {
        if (err) {
            console.error("Lỗi lấy task:", err);
            return res.status(500).json({ success: false, message: "Lỗi database" });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy task hoặc bạn không có quyền truy cập" });
        }
        res.json({ success: true, data: results[0] });
    });
};

// POST /api/tasks
exports.createTask = (req, res) => {
    // Đã xóa board_id, thay bằng các trường mới của DB
    const { title, description, status, deadline, priority, project_id, assigned_to } = req.body;
    const userId = req.user_id; 

    if (!title || title.trim() === "") {
        return res.status(400).json({ success: false, message: "Tiêu đề task không được để trống!" });
    }

    // Xử lý giá trị null từ FE gửi lên (Rất quan trọng cho DB)
    const finalProjectId = (project_id === 'null' || project_id === '' || project_id === undefined) ? null : project_id;
    const finalAssignedTo = (assigned_to === 'null' || assigned_to === '' || assigned_to === undefined) ? null : assigned_to;

    const taskData = {
        title: title.trim(),
        description: description || null,
        status: status || "To Do",
        deadline: deadline ? new Date(deadline) : null, 
        priority: priority || "Medium", // Mặc định là Medium nếu người dùng không chọn
        project_id: finalProjectId,
        assigned_to: finalAssignedTo,
        user_id: userId // Ghi nhận ai là người tạo
    };

    Task.createTask(taskData, (err, results) => {
        if (err) {
            console.error("Lỗi tạo task:", err);
            return res.status(500).json({ success: false, message: "Lỗi database" });
        }

        res.status(201).json({
            success: true,
            message: "Tạo task thành công!",
            data: { task_id: results.insertId, ...taskData }
            });
    });
};

// PUT /api/tasks/:id
exports.updateTask = (req, res) => {
    const { id } = req.params;
    const userId = req.user_id;
    
    // Bổ sung lấy thêm priority, project_id, assigned_to từ req.body
    const { title, description, status, deadline, priority, project_id, assigned_to } = req.body;

    // BƯỚC 1: Tìm đúng task của user đó
    Task.getTaskById(id, userId, (err, results) => {
        if (err) {
            console.error("Lỗi lấy task để update:", err);
            return res.status(500).json({ success: false, message: "Lỗi database" });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy task hoặc không có quyền sửa" });
        }
        const oldTask = results[0];

        // BƯỚC 2: Gom dữ liệu (Cập nhật thêm các trường mới)
        const taskData = {
            title: title !== undefined ? title : oldTask.title,
            description: description !== undefined ? description : oldTask.description,
            status: status !== undefined ? status : oldTask.status,
            deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : oldTask.deadline,
            // Thêm Priority
            priority: priority !== undefined ? priority : oldTask.priority,
            // Thêm Project ID
            project_id: project_id !== undefined ? (project_id === 'null' || project_id === '' ? null : project_id) : oldTask.project_id,
            // Thêm Assigned To
            assigned_to: assigned_to !== undefined ? (assigned_to === 'null' || assigned_to === '' ? null : assigned_to) : oldTask.assigned_to
        };

        // BƯỚC 3: Cập nhật xuống DB
        Task.updateTask(id, userId, taskData, (updateErr, updateResults) => {
            if (updateErr) {
                console.error("Lỗi update task:", updateErr);
                return res.status(500).json({ success: false, message: "Lỗi database" });
            }
            res.json({ success: true, message: "Cập nhật task thành công!" });
        });
    });
};

// DELETE /api/tasks/:id
exports.deleteTask = (req, res) => {
    const { id } = req.params;
    const userId = req.user_id;

    // Hàm Xóa giữ nguyên
    Task.deleteTask(id, userId, (err, results) => {
        if (err) {
            console.error("Lỗi xóa task:", err);
            return res.status(500).json({ success: false, message: "Lỗi database" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy task hoặc không có quyền xóa" });
        }
        res.json({ success: true, message: "Xóa task thành công!" });
    });
};