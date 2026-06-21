// api/users/[id].js
// DELETE -> hapus user (admin only)

const { query } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

async function handleDelete(req, res, id) {
  try {
    const rows = await query('SELECT id, role FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }
    if (rows[0].role === 'admin') {
      return res.status(400).json({ error: 'Akun admin tidak dapat dihapus dari sini.' });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Pengguna berhasil dihapus.' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ error: 'Gagal menghapus pengguna.' });
  }
}

module.exports = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID pengguna wajib disertakan.' });
  }
  if (req.method === 'DELETE') {
    return requireAuth((r, s) => handleDelete(r, s, id), ['admin'])(req, res);
  }
  return res.status(405).json({ error: 'Method tidak diizinkan.' });
};
