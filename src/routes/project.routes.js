const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const projectTaskController = require('../controllers/projectTask.controller');

// Import đúng tên hàm verifyToken
const { verifyToken } = require('../middleware/auth.middleware'); 

// ==================== CÁC ROUTE DỰ ÁN ====================
// Lấy danh sách dự án (GET)
router.get('/', verifyToken, projectController.getAllProjects);

// Tạo dự án mới (POST)
router.post('/', verifyToken, projectController.createProject);

// Lấy chi tiết dự án kèm danh sách task (GET)
router.get('/:projectId', verifyToken, projectController.getProjectDetail);

// Xóa dự án (DELETE)
router.delete('/:projectId', verifyToken, projectController.deleteProject);

// Thêm thành viên vào dự án (POST)
router.post('/:projectId/members', verifyToken, projectController.addMember);

// ==================== CÁC ROUTE TASK CỦA DỰ ÁN ====================
// Lấy danh sách task trong dự án (GET)
router.get('/:projectId/tasks', verifyToken, projectTaskController.getProjectTasks);

// Tạo task mới trong dự án (POST)
router.post('/:projectId/tasks', verifyToken, projectTaskController.createProjectTask);

// Sửa & Xóa Task trong dự án
router.put('/:projectId/tasks/:taskId', verifyToken, projectTaskController.updateProjectTask);
router.delete('/:projectId/tasks/:taskId', verifyToken, projectTaskController.deleteProjectTask);

// Thêm dòng này vào file route của Project
router.delete('/:projectId/members/:memberId', verifyToken, projectController.removeMember);

module.exports = router;