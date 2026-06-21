// lib/auth.js
// Helper untuk membuat & memverifikasi JWT, dipakai di semua API yang butuh login.

const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'ganti-secret-ini-di-env';

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

// Ambil & verifikasi token dari header Authorization: Bearer <token>
function getUserFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  return verifyToken(token);
}

// Bungkus handler API supaya otomatis cek login & (opsional) role.
function requireAuth(handler, allowedRoles = null) {
  return async (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: 'Sesi tidak valid, silakan login kembali.' });
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      res.status(403).json({ error: 'Anda tidak punya akses ke fitur ini.' });
      return;
    }
    req.user = user;
    return handler(req, res);
  };
}

module.exports = { signToken, verifyToken, getUserFromRequest, requireAuth };
