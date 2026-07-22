const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');

// Import middleware xác thực đúng chuẩn (lùi ra 1 thư mục bằng ../ rồi mới vào middleware)
const authMiddleware = require('../middleware/auth.middleware'); 

// API Lấy danh sách dự án (GET)
router.get('/', authMiddleware, projectController.getAllProjects);

// API Tạo dự án mới (POST)
router.post('/', authMiddleware, projectController.createProject);

module.exports = router;