const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// Test route
router.get("/test", (req, res) => {
    res.json({
        message: "Auth route is working"
    });
});

// Register
router.post("/register", authController.register);

module.exports = router;