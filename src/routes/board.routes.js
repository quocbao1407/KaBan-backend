const express = require("express");
const router = express.Router();

const boardController = require("../controllers/board.controller");

router.get("/", boardController.getAllBoards);

router.get("/:id", boardController.getBoardById);

router.post("/", boardController.createBoard);

router.put("/:id", boardController.updateBoard);

router.delete("/:id", boardController.deleteBoard);

module.exports = router;