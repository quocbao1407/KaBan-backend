const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const projectTaskController = require('../controllers/projectTask.controller');

// Import đúng tên hàm verifyToken (có dấu ngoặc nhọn)
const { verifyToken } = require('../middleware/auth.middleware'); 

// API Lấy danh sách dự án (GET)
router.get('/', verifyToken, projectController.getAllProjects);

// API Tạo dự án mới (POST)
router.post('/', verifyToken, projectController.createProject);

// API Lấy chi tiết dự án kèm danh sách task (GET)
router.get('/:projectId', verifyToken, projectController.getProjectDetail);

// ==================== CÁC ROUTE TASK CỦA DỰ ÁN ====================
// API Lấy danh sách task trong dự án (GET)
router.get('/:projectId/tasks', verifyToken, projectTaskController.getProjectTasks);

// API Tạo task mới trong dự án (POST)
router.post('/:projectId/tasks', verifyToken, projectTaskController.createProjectTask);

// API Thêm thành viên vào dự án
router.post('/:projectId/members', verifyToken, projectController.addMember);

// API cập nhật task (đổi trạng thái, sửa nội dung)
router.put('/:projectId/tasks/:taskId', verifyToken, projectTaskController.updateTask);

module.exports = router;