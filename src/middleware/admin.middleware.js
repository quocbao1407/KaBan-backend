// src/middleware/admin.middleware.js
const db = require('../config/db');

exports.verifyAdmin = (req, res, next) => {
  const userId = req.user_id; // Đã được auth middleware gắn vào từ token

  const sql = 'SELECT role FROM Users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền admin!' });
    }

    if (results.length === 0 || results[0].role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Quyền truy cập bị từ chối! Chỉ Admin mới có quyền thực hiện.' });
    }

    next();
  });
};