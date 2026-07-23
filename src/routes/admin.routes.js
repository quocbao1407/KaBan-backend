// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt'); // Sử dụng 'bcrypt' đồng bộ với toàn bộ Backend
const jwt = require('jsonwebtoken');

// 1. Middleware kiểm tra Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Thiếu token xác thực!' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
    req.user_id = decoded.id;
    next();
  });
};

// 2. Middleware kiểm tra quyền Admin
const verifyAdmin = (req, res, next) => {
  const userId = req.user_id;
  const sql = 'SELECT role FROM Users WHERE id = ?';

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Lỗi verifyAdmin:", err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi kiểm tra quyền!' });
    }

    if (results.length === 0 || (results[0].role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền Admin!' });
    }

    next();
  });
};

// Áp dụng bảo vệ cho tất cả routes phía dưới
router.use(verifyToken, verifyAdmin);

// API 1: Lấy danh sách tất cả người dùng
router.get('/users', (req, res) => {
  const sql = 'SELECT id, name, email, role, created_at FROM Users ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Lỗi lấy danh sách user:", err);
      return res.status(500).json({ success: false, message: 'Lỗi CSDL khi lấy danh sách người dùng!' });
    }
    res.json({ success: true, data: results });
  });
});

// API 2: Tạo tài khoản mới
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
          return res.status(400).json({ success: false, message: 'Email này đã tồn tại!' });
        }
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo tài khoản!' });
      }
      res.status(201).json({ success: true, message: 'Tạo tài khoản thành công!' });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi mã hóa mật khẩu!' });
  }
  });

// API 3: Cập nhật thông tin User
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;

  try {
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = 'UPDATE Users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?';
      db.query(sql, [name, email, role, hashedPassword, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật user!' });
        res.json({ success: true, message: 'Cập nhật tài khoản thành công!' });
      });
    } else {
      const sql = 'UPDATE Users SET name = ?, email = ?, role = ? WHERE id = ?';
      db.query(sql, [name, email, role, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật user!' });
        res.json({ success: true, message: 'Cập nhật tài khoản thành công!' });
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ!' });
  }
});

// API 4: Xóa người dùng
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