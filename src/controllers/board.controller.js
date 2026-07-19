const Board = require("../models/board.model");

// GET /api/boards
exports.getAllBoards = (req, res) => {
    const userId = req.user_id; // Lấy ID của user đang đăng nhập từ Token

    Board.getAll(userId, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Lỗi database"
            });
        }

        return res.status(200).json({
            success: true,
            data: results
        });
    });
};

// GET /api/boards/:id
exports.getBoardById = (req, res) => {
    const id = req.params.id;
    const userId = req.user_id; // Gắn thêm ID user

    Board.getById(id, userId, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Lỗi database"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy board hoặc bạn không có quyền truy cập"
            });
        }

        return res.status(200).json({
            success: true,
            data: results[0]
        });
    });
};

// POST /api/boards
exports.createBoard = (req, res) => {
    const { name } = req.body; 
    const userId = req.user_id; // BẮT BUỘC lấy user_id từ Token (bảo mật)

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Tên board không được để trống"
        });
    }

    Board.create(userId, name, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Tạo board thất bại"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Tạo board thành công"
        });
    });
};

// PUT /api/boards/:id
exports.updateBoard = (req, res) => {
    const id = req.params.id;
    const { name } = req.body;
    const userId = req.user_id; // Gắn thêm ID user

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Tên board không được để trống"
        });
    }

    // Cập nhật board cần khớp cả id của board và userId
    Board.update(id, userId, name, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Cập nhật board thất bại"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật board thành công"
        });
    });
};

// DELETE /api/boards/:id
exports.deleteBoard = (req, res) => {
    const id = req.params.id;
    const userId = req.user_id; // Gắn thêm ID user

    Board.delete(id, userId, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Xóa board thất bại"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy board hoặc không có quyền xóa"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xóa board thành công"
        });
    });
};