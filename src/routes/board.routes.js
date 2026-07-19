const express = require("express");
const router = express.Router();
const boardController = require("../controllers/board.controller");

// Import middleware bảo vệ
const { verifyToken } = require("../middleware/auth.middleware");

// Gắn chốt bảo vệ vào toàn bộ route của board
router.get("/", verifyToken, boardController.getAllBoards);
router.get("/:id", verifyToken, boardController.getBoardById);
router.post("/", verifyToken, boardController.createBoard);
router.put("/:id", verifyToken, boardController.updateBoard);
router.delete("/:id", verifyToken, boardController.deleteBoard);

module.exports = router;