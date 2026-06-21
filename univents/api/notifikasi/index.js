// api/notifikasi/index.js
// GET -> list notifikasi milik user yang login
// PUT -> tandai semua/satu notifikasi sebagai sudah dibaca

const { query } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

async function handleGet(req, res) {
  try {
    const rows = await query(
      `SELECT * FROM notifikasi WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({ notifikasi: rows });
  } catch (err) {
    console.error('Get notifikasi error:', err);
    return res.status(500).json({ error: 'Gagal mengambil notifikasi.' });
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.body;
    if (id) {
      await query(
        'UPDATE notifikasi SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [id, req.user.id]
      );
    } else {
      await query('UPDATE notifikasi SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    }
    return res.status(200).json({ message: 'Notifikasi diperbarui.' });
  } catch (err) {
    console.error('Update notifikasi error:', err);
    return res.status(500).json({ error: 'Gagal memperbarui notifikasi.' });
  }
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return requireAuth(handleGet)(req, res);
  }
  if (req.method === 'PUT') {
    return requireAuth(handlePut)(req, res);
  }
  return res.status(405).json({ error: 'Method tidak diizinkan.' });
};
