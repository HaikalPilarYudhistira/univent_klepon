// api/peserta/[id].js
// PUT -> ubah status kehadiran (admin: hadir/batal, mahasiswa: batalkan punya sendiri)

const { query } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

async function handlePut(req, res, id) {
  try {
    const rows = await query('SELECT * FROM peserta WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Data peserta tidak ditemukan.' });
    }
    const peserta = rows[0];

    if (req.user.role !== 'admin' && peserta.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Anda tidak punya akses untuk mengubah data ini.' });
    }

    const { status_kehadiran } = req.body;
    if (!['terdaftar', 'hadir', 'batal'].includes(status_kehadiran)) {
      return res.status(400).json({ error: 'Status kehadiran tidak valid.' });
    }

    await query('UPDATE peserta SET status_kehadiran = ? WHERE id = ?', [status_kehadiran, id]);
    return res.status(200).json({ message: 'Status berhasil diperbarui.' });
  } catch (err) {
    console.error('Update peserta error:', err);
    return res.status(500).json({ error: 'Gagal memperbarui status peserta.' });
  }
}

module.exports = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID peserta wajib disertakan.' });
  }
  if (req.method === 'PUT') {
    return requireAuth((r, s) => handlePut(r, s, id))(req, res);
  }
  return res.status(405).json({ error: 'Method tidak diizinkan.' });
};
