const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const boardRoutes = require("./routes/board.routes");
const taskRoutes = require("./routes/task.routes");
const projectRoutes = require("./routes/project.routes");

const app = express();

app.use(cors({
    origin: '*', // Cho phép mọi nguồn (localhost, domain web...) truy cập
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Các hành động được phép
    allowedHeaders: ['Content-Type', 'Authorization'] // Cho phép gửi Token
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Backend is running"
    });
});

module.exports = app;