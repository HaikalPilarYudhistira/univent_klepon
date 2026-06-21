// api/auth/register.js
const bcrypt = require('bcryptjs');
const { query } = require('../../lib/db');
const { signToken } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan.' });
  }

  try {
    const { nama, email, password, nim, jurusan, no_hp } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar. Gunakan email lain atau masuk.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (nama, email, password, role, nim, jurusan, no_hp)
       VALUES (?, ?, ?, 'mahasiswa', ?, ?, ?)`,
      [nama, email, hashed, nim || null, jurusan || null, no_hp || null]
    );

    const newUser = {
      id: result.insertId,
      nama,
      email,
      role: 'mahasiswa',
    };

    const token = signToken(newUser);

    return res.status(201).json({
      message: 'Pendaftaran berhasil.',
      token,
      user: newUser,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
};
