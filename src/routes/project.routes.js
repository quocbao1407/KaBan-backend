const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');

// Import đúng tên hàm verifyToken (có dấu ngoặc nhọn)
const { verifyToken } = require('../middleware/auth.middleware'); 

// API Lấy danh sách dự án (GET)
router.get('/', verifyToken, projectController.getAllProjects);

// API Tạo dự án mới (POST)
router.post('/', verifyToken, projectController.createProject);

module.exports = router;