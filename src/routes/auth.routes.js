const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.get("/test", (req, res) => {
    res.json({
        message: "Auth route is working"
    });
});

// Register (Đăng ký)
router.post("/register", authController.register);

// Login (Đăng nhập - Bắt buộc phải thêm dòng này)
router.post("/login", authController.login);

module.exports = router;