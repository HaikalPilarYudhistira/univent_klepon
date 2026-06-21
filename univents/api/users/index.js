// api/users/index.js
// GET -> list semua user (admin only)

const { query } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

async function handleGet(req, res) {
  try {
    const rows = await query(
      `SELECT id, nama, email, role, nim, jurusan, no_hp, created_at FROM users ORDER BY created_at DESC`
    );
    return res.status(200).json({ users: rows });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Gagal mengambil data pengguna.' });
  }
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return requireAuth(handleGet, ['admin'])(req, res);
  }
  return res.status(405).json({ error: 'Method tidak diizinkan.' });
};
