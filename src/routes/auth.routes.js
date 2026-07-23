const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Đã sửa: Dùng { verifyToken } để giải nén đúng hàm từ file middleware
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/test", (req, res) => {
    res.json({
        message: "Auth route is working"
    });
});

// Register (Đăng ký)
router.post("/register", authController.register);

// Login (Đăng nhập)
router.post("/login", authController.login);

// --- CÁC ROUTE CẦN ĐĂNG NHẬP (DÙNG CHO TRANG SETTINGS) ---
// 1. Lấy thông tin user hiện tại
router.get("/me", verifyToken, authController.getMe);

// 2. Cập nhật Họ và tên
router.put("/profile", verifyToken, authController.updateProfile);

// 3. Đổi mật khẩu
router.put("/change-password", verifyToken, authController.changePassword);

module.exports = router;