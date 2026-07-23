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
// Xóa task dự án
exports.deleteProjectTask = (req, res) => {
    const { taskId } = req.params;

    ProjectTask.deleteTask(taskId, (err, result) => {
        if (err) {
            console.error("Lỗi xóa task:", err);
            return res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
        return res.status(200).json({ success: true, message: "Xóa công việc thành công!" });
    });
};

// Cập nhật task dự án (Nội dung, người thực hiện, hạn chót, trạng thái)
exports.updateProjectTask = (req, res) => {
    const { taskId } = req.params;
    const taskData = req.body;

    ProjectTask.updateTask(taskId, taskData, (err, result) => {
        if (err) {
            console.error("Lỗi cập nhật task:", err);
            return res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
        return res.status(200).json({ success: true, message: "Cập nhật công việc thành công!" });
    });
};

// Trong src/controllers/task.controller.js (Đoạn hàm deleteTask)
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user_id;

  try {
    // 1. Lấy thông tin task
    const [tasks] = await db.query('SELECT * FROM tasks WHERE task_id = ?', [id]);
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy công việc!' });
    }
    const task = tasks[0];

    // 2. Nếu là Task trong Dự án -> Kiểm tra xem user có phải LEADER không
    if (task.project_id) {
      const [members] = await db.query(
        'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
        [task.project_id, userId]
      );

      const isLeader = members.length > 0 && members[0].role === 'leader';
      
      if (!isLeader) {
        return res.status(403).json({ message: 'Thành viên (Member) không có quyền xóa task trong dự án!' });
      }
    } else {
      // Nếu là Task cá nhân -> Chỉ chính chủ mới được xóa
      if (task.user_id !== userId) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa task này!' });
      }
    }

    // 3. Tiến hành xóa
    await db.query('DELETE FROM tasks WHERE task_id = ?', [id]);
    return res.json({ message: 'Xóa công việc thành công!' });

  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server khi xóa task!', error: error.message });
  }
};