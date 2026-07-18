const Task = require('../models/task.model');

const TaskService = {
    createTask: (taskData, callback) => {
        // Chuẩn hóa dữ liệu đầu vào (ví dụ: cắt khoảng trắng thừa)
        if (taskData.title) {
            taskData.title = taskData.title.trim();
        }
        
        // Gọi xuống model và truyền callback tiếp đi
        Task.create(taskData, callback);
    }
};

module.exports = TaskService;