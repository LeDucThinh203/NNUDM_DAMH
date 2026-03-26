import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Tạo JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Xác thực JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
};

/**
 * Middleware xác thực - yêu cầu đăng nhập
 */
export const authenticate = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ error: 'Không tìm thấy token xác thực' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Lưu thông tin user vào request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Xác thực thất bại' });
  }
};

/**
 * Middleware kiểm tra quyền admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Chưa xác thực' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Không có quyền truy cập. Yêu cầu quyền admin' });
  }

  next();
};

// Compat với phong cách NNPTUD-C6: CheckPermission('admin')
export const checkPermission = (...requiredRoles) => {
  const normalized = requiredRoles.map((role) => String(role).toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa xác thực' });
    }

    const currentRole = String(req.user.role || '').toLowerCase();
    if (!normalized.includes(currentRole)) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    next();
  };
};

/**
 * Middleware kiểm tra quyền user hoặc admin
 */
export const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Chưa xác thực' });
  }

  if (req.user.role !== 'user' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Không có quyền truy cập' });
  }

  next();
};

/**
 * Middleware kiểm tra user có phải là chính họ hoặc admin
 */
export const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Chưa xác thực' });
  }

  const userId = parseInt(req.params.id);
  
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Không có quyền truy cập tài nguyên này' });
  }

  next();
};

/**
 * Middleware xác thực tùy chọn - không bắt buộc đăng nhập
 */
export const optionalAuth = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (token) {
      const decoded = verifyToken(token);

      if (decoded) {
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

// Alias theo NNPTUD-C6
export const checkLogin = authenticate;
export const CheckPermission = checkPermission;

export default {
  generateToken,
  verifyToken,
  authenticate,
  checkLogin,
  requireAdmin,
  checkPermission,
  CheckPermission,
  requireUser,
  requireSelfOrAdmin,
  optionalAuth
};
