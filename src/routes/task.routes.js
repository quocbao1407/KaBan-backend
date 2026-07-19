const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");

const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, taskController.getAllTasks);

router.get("/:id", verifyToken, taskController.getTaskById);

router.post("/", verifyToken, taskController.createTask);

router.put("/:id", verifyToken, taskController.updateTask);

router.delete("/:id", verifyToken, taskController.deleteTask);

module.exports = router;