const db = require("../src/config/db");

console.log("Starting seed...");

const users = `
INSERT INTO users (username, password)
VALUES
('admin', '123456'),
('bao', '123456'),
('user1', '123456'),
('user2', '123456');
`;

const boards = `
INSERT INTO board (user_id, name)
VALUES
(1, 'Công việc'),
(1, 'Học tập'),
(2, 'Dự án Backend'),
(3, 'Cá nhân');
`;

const tasks = `
INSERT INTO task (board_id, title, description, deadline, status)
VALUES
(1, 'Thiết kế Database', 'Hoàn thành ERD và tạo bảng', '2026-07-15 23:59:59', 'Done'),
(1, 'Viết API Login', 'Code chức năng đăng nhập', '2026-07-16 23:59:59', 'In Progress'),
(2, 'Ôn JavaScript', 'Làm bài tập ExpressJS', '2026-07-17 23:59:59', 'To Do'),
(3, 'Kết nối MySQL', 'Kiểm tra kết nối database', '2026-07-18 23:59:59', 'Done'),
(4, 'Viết báo cáo', 'Hoàn thành báo cáo thực tập', '2026-07-20 23:59:59', 'To Do');
`;

db.query(users, (err, result) => {
    if (err) {
        console.error(err);
        db.end();
        return;
    }

    console.log(`${result.affectedRows} users inserted!`);

    db.query(boards, (err, result) => {
        if (err) {
            console.error(err);
            db.end();
            return;
        }

        console.log(`${result.affectedRows} boards inserted!`);

        db.query(tasks, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`${result.affectedRows} tasks inserted!`);
            }

            db.end();
        });
    });
});