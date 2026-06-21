// api/events/[id].js
// GET    -> detail satu event (publik)
// PUT    -> update event (admin only)
// DELETE -> hapus event (admin only)

const { query } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

async function handleGet(req, res, id) {
  try {
    const rows = await query(
      `SELECT e.*, u.nama AS pembuat,
        (SELECT COUNT(*) FROM peserta p WHERE p.event_id = e.id AND p.status_kehadiran != 'batal') AS jumlah_peserta
       FROM events e
       JOIN users u ON e.dibuat_oleh = u.id
       WHERE e.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event tidak ditemukan.' });
    }

    return res.status(200).json({ event: rows[0] });
  } catch (err) {
    console.error('Get event detail error:', err);
    return res.status(500).json({ error: 'Gagal mengambil detail event.' });
  }
}

async function handlePut(req, res, id) {
  try {
    const existing = await query('SELECT id FROM events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Event tidak ditemukan.' });
    }

    const {
      judul, deskripsi, kategori, lokasi,
      tanggal_mulai, tanggal_selesai, kuota, poster_url, status,
    } = req.body;

    await query(
      `UPDATE events SET
        judul = ?, deskripsi = ?, kategori = ?, lokasi = ?,
        tanggal_mulai = ?, tanggal_selesai = ?, kuota = ?, poster_url = ?, status = ?
       WHERE id = ?`,
      [
        judul, deskripsi || null, kategori || 'lainnya', lokasi || null,
        tanggal_mulai, tanggal_selesai || null, kuota || 0, poster_url || null,
        status || 'published', id,
      ]
    );

    return res.status(200).json({ message: 'Event berhasil diperbarui.' });
  } catch (err) {
    console.error('Update event error:', err);
    return res.status(500).json({ error: 'Gagal memperbarui event.' });
  }
}

async function handleDelete(req, res, id) {
  try {
    const existing = await query('SELECT id FROM events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Event tidak ditemukan.' });
    }

    await query('DELETE FROM events WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Event berhasil dihapus.' });
  } catch (err) {
    console.error('Delete event error:', err);
    return res.status(500).json({ error: 'Gagal menghapus event.' });
  }
}

module.exports = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID event wajib disertakan.' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  }
  if (req.method === 'PUT') {
    return requireAuth((r, s) => handlePut(r, s, id), ['admin'])(req, res);
  }
  if (req.method === 'DELETE') {
    return requireAuth((r, s) => handleDelete(r, s, id), ['admin'])(req, res);
  }
  return res.status(405).json({ error: 'Method tidak diizinkan.' });
};
