const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // FE sẽ gửi token có dạng: "Bearer asdfghjkl..."
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có quyền truy cập, vui lòng đăng nhập!' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Giải mã token xem có đúng do mình cấp không
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Gắn user_id vào request để các hàm phía sau lấy được
    req.user_id = decoded.id; 
    
    next(); // Cho phép đi tiếp vào Controller
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
};