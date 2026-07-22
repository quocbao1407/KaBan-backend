const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // Vẫn giữ nguyên Model cũ của BE

// --- 1. HÀM ĐĂNG KÝ (Đã bổ sung nhận name từ Frontend) ---
exports.register = async (req, res) => {
    try {
        // Nhận name, email và password từ Frontend gửi lên
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Tên, email và password không được để trống"
            });
        }

        // Lưu ý BE: Phải vào file user.model.js đổi hàm findByUsername thành findByEmail
        User.findByEmail(email, async (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Lỗi database" });
            }

            if (results.length > 0) {
                return res.status(409).json({ success: false, message: "Email đã tồn tại" });
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Lưu vào database (truyền thêm name vào hàm create của Model)
            User.create(name, email, hashedPassword, (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: "Đăng ký thất bại" });
                }

                return res.status(201).json({ success: true, message: "Đăng ký thành công!" });
            });
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};


// --- 2. HÀM ĐĂNG NHẬP (Đã sửa chuẩn cú pháp jwt.sign) ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mật khẩu"
            });
        }

        // Tìm xem email có trong DB không
        User.findByEmail(email, async (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Lỗi database" });
            }

            if (results.length === 0) {
                return res.status(404).json({ success: false, message: "Email không tồn tại!" });
            }

            const user = results[0]; // Lấy thông tin user tìm được

            // Đọc mật khẩu FE gửi lên với mật khẩu đã mã hóa trong DB
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Sai mật khẩu!" });
            }

            // Cấp thẻ Token (JWT) - Đã sửa lỗi cú pháp expiresIn
            const token = jwt.sign(
                { id: user.id }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1d' }
            );

            // Trả Token về cho Frontend cất vào két sắt
            return res.status(200).json({ 
                success: true, 
                message: "Đăng nhập thành công", 
                token: token 
            });
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};