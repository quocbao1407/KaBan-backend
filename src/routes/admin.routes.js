// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../middleware/auth.middleware');
const { verifyAdmin } = require('../middleware/admin.middleware');

// Áp dụng bảo vệ: Cần có Token + Phải là Admin
router.use(verifyToken, verifyAdmin);

// 1. Lấy danh sách tất cả người dùng
router.get('/users', (req, res) => {
  const sql = 'SELECT id, name, email, role, created_at FROM Users ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Lỗi lấy danh sách user' });
    res.json({ success: true, data: results });
  });
});

// 2. Tạo tài khoản mới (Admin khởi tạo)
router.post('/users', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, hashedPassword, role || 'user'], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Email này đã tồn tại trong hệ thống!' });
        }
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo tài khoản!' });
      }
      res.status(201).json({ success: true, message: 'Tạo tài khoản thành công!' });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi mã hóa mật khẩu!' });
  }
});

// 3. Cập nhật thông tin / vai trò của User
router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const sql = 'UPDATE Users SET name = ?, email = ?, role = ? WHERE id = ?';
  db.query(sql, [name, email, role, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật thông tin user!' });
    res.json({ success: true, message: 'Cập nhật tài khoản thành công!' });
  });
});

// 4. Xóa tài khoản người dùng
router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const currentAdminId = req.user_id;

  if (parseInt(id) === parseInt(currentAdminId)) {
    return res.status(400).json({ success: false, message: 'Bạn không thể tự xóa tài khoản của chính mình!' });
  }

  const sql = 'DELETE FROM Users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Lỗi khi xóa người dùng!' });
    res.json({ success: true, message: 'Đã xóa tài khoản thành công!' });
  });
});

module.exports = router;