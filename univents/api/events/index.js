// api/events/index.js
// GET  -> list semua event (publik, bisa difilter kategori/status)
// POST -> buat event baru (khusus admin, butuh token)

const { query } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

async function handleGet(req, res) {
  try {
    const { kategori, status } = req.query;
    let sql = `
      SELECT e.*, u.nama AS pembuat,
        (SELECT COUNT(*) FROM peserta p WHERE p.event_id = e.id AND p.status_kehadiran != 'batal') AS jumlah_peserta
      FROM events e
      JOIN users u ON e.dibuat_oleh = u.id
      WHERE 1=1
    `;
    const params = [];

    if (kategori) {
      sql += ' AND e.kategori = ?';
      params.push(kategori);
    }
    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY e.tanggal_mulai ASC';

    const rows = await query(sql, params);
    return res.status(200).json({ events: rows });
  } catch (err) {
    console.error('Get events error:', err);
    return res.status(500).json({ error: 'Gagal mengambil data event.' });
  }
}

async function handlePost(req, res) {
  try {
    const {
      judul, deskripsi, kategori, lokasi,
      tanggal_mulai, tanggal_selesai, kuota, poster_url, status,
    } = req.body;

    if (!judul || !tanggal_mulai) {
      return res.status(400).json({ error: 'Judul dan tanggal mulai wajib diisi.' });
    }

    const result = await query(
      `INSERT INTO events
        (judul, deskripsi, kategori, lokasi, tanggal_mulai, tanggal_selesai, kuota, poster_url, status, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        judul,
        deskripsi || null,
        kategori || 'lainnya',
        lokasi || null,
        tanggal_mulai,
        tanggal_selesai || null,
        kuota || 0,
        poster_url || null,
        status || 'published',
        req.user.id,
      ]
    );

    return res.status(201).json({
      message: 'Event berhasil dibuat.',
      eventId: result.insertId,
    });
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ error: 'Gagal membuat event.' });
  }
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }
  if (req.method === 'POST') {
    return requireAuth(handlePost, ['admin'])(req, res);
  }
  return res.status(405).json({ error: 'Method tidak diizinkan.' });
};
