// api/peserta/index.js
// GET  -> list peserta (admin: per event via ?event_id=, mahasiswa: event yang sudah didaftar via token)
// POST -> mahasiswa daftar ke event

const { query } = require('../../lib/db');
const { requireAuth } = require('../../lib/auth');

async function handleGet(req, res) {
  try {
    const { event_id } = req.query;

    if (req.user.role === 'admin') {
      if (!event_id) {
        return res.status(400).json({ error: 'event_id wajib disertakan untuk admin.' });
      }
      const rows = await query(
        `SELECT p.*, u.nama, u.email, u.nim, u.jurusan
         FROM peserta p
         JOIN users u ON p.user_id = u.id
         WHERE p.event_id = ?
         ORDER BY p.tanggal_daftar ASC`,
        [event_id]
      );
      return res.status(200).json({ peserta: rows });
    }

    // mahasiswa: lihat event yang sudah ia daftar
    const rows = await query(
      `SELECT p.*, e.judul, e.tanggal_mulai, e.lokasi, e.status AS status_event
       FROM peserta p
       JOIN events e ON p.event_id = e.id
       WHERE p.user_id = ?
       ORDER BY e.tanggal_mulai ASC`,
      [req.user.id]
    );
    return res.status(200).json({ peserta: rows });
  } catch (err) {
    console.error('Get peserta error:', err);
    return res.status(500).json({ error: 'Gagal mengambil data peserta.' });
  }
}

async function handlePost(req, res) {
  try {
    const { event_id } = req.body;
    if (!event_id) {
      return res.status(400).json({ error: 'event_id wajib diisi.' });
    }

    const events = await query('SELECT * FROM events WHERE id = ?', [event_id]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event tidak ditemukan.' });
    }
    const event = events[0];

    if (event.status !== 'published') {
      return res.status(400).json({ error: 'Event ini belum dibuka atau sudah ditutup untuk pendaftaran.' });
    }

    if (event.kuota > 0) {
      const countRows = await query(
        `SELECT COUNT(*) AS total FROM peserta WHERE event_id = ? AND status_kehadiran != 'batal'`,
        [event_id]
      );
      if (countRows[0].total >= event.kuota) {
        return res.status(400).json({ error: 'Kuota event ini sudah penuh.' });
      }
    }

    const existing = await query(
      'SELECT id FROM peserta WHERE event_id = ? AND user_id = ?',
      [event_id, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Anda sudah terdaftar di event ini.' });
    }

    await query(
      'INSERT INTO peserta (event_id, user_id) VALUES (?, ?)',
      [event_id, req.user.id]
    );

    await query(
      `INSERT INTO notifikasi (user_id, judul, pesan, event_id)
       VALUES (?, ?, ?, ?)`,
      [
        req.user.id,
        'Pendaftaran berhasil',
        `Kamu telah terdaftar di event "${event.judul}". Jangan lupa hadir ya!`,
        event_id,
      ]
    );

    return res.status(201).json({ message: 'Berhasil mendaftar ke event ini.' });
  } catch (err) {
    console.error('Daftar peserta error:', err);
    return res.status(500).json({ error: 'Gagal mendaftar ke event.' });
  }
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return requireAuth(handleGet)(req, res);
  }
  if (req.method === 'POST') {
    return requireAuth(handlePost, ['mahasiswa'])(req, res);
  }
  return res.status(405).json({ error: 'Method tidak diizinkan.' });
};
