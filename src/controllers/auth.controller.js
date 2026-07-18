const bcrypt = require("bcrypt");
const User = require("../models/user.model");

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username và password không được để trống"
            });
        }

        // Kiểm tra username đã tồn tại chưa
        User.findByUsername(username, async (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Lỗi database"
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Username đã tồn tại"
                });
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Lưu vào database
            User.create(username, hashedPassword, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Đăng ký thất bại"
                    });
                }

                return res.status(201).json({
                    success: true,
                    message: "Đăng ký thành công"
                });
            });
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};