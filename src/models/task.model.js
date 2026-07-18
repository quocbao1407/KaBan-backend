const db = require("../config/db");

const Task = {

    // Lấy tất cả task
    getAllTasks: (callback) => {
        const sql = "SELECT * FROM task";

        db.query(sql, callback);
    },


    // Lấy task theo id
    getTaskById: (id, callback) => {
        const sql = "SELECT * FROM task WHERE task_id = ?";

        db.query(sql, [id], callback);
    },


    // Tạo task
    createTask: (taskData, callback) => {
        const {
            title,
            description,
            status,
            deadline,
            board_id
        } = taskData;


        const sql = `
            INSERT INTO task
            (title, description, status, deadline, board_id)
            VALUES (?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                title,
                description || null,
                status || "To Do",
                deadline || null,
                board_id
            ],
            callback
        );
    },


    // Update task
    updateTask: (id, taskData, callback) => {

        const {
            title,
            description,
            status,
            deadline
        } = taskData;


        const sql = `
            UPDATE task
            SET 
                title = ?,
                description = ?,
                status = ?,
                deadline = ?
            WHERE task_id = ?
        `;


        db.query(
            sql,
            [
                title,
                description,
                status,
                deadline,
                id
            ],
            callback
        );

    },


    // Delete task
    deleteTask: (id, callback) => {

        const sql = "DELETE FROM task WHERE task_id = ?";


        db.query(
            sql,
            [id],
            callback
        );

    }

};


module.exports = Task;