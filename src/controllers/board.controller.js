const Board = require("../models/board.model");

// GET /api/boards
exports.getAllBoards = (req, res) => {
    Board.getAll((err, results) => {
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

    Board.getById(id, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Lỗi database"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy board"
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
    const { user_id, name } = req.body;

    if (!user_id || !name) {
        return res.status(400).json({
            success: false,
            message: "user_id và name không được để trống"
        });
    }

    Board.create(user_id, name, (err, result) => {
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

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Tên board không được để trống"
        });
    }

    Board.update(id, name, (err, result) => {
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

    Board.delete(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Xóa board thất bại"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy board"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xóa board thành công"
        });
    });
};