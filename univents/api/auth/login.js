// api/auth/login.js
const bcrypt = require('bcryptjs');
const { query } = require('../../lib/db');
const { signToken } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan.' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const payload = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    };

    const token = signToken(payload);

    return res.status(200).json({
      message: 'Berhasil masuk.',
      token,
      user: payload,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
};
