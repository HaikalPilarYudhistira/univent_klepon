-- ============================================
-- UNIVENTS Database Schema
-- Compatible dengan MySQL / PlanetScale
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'mahasiswa') NOT NULL DEFAULT 'mahasiswa',
  nim VARCHAR(30) DEFAULT NULL,
  jurusan VARCHAR(100) DEFAULT NULL,
  no_hp VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  deskripsi TEXT,
  kategori ENUM('akademik', 'seni', 'olahraga', 'organisasi', 'lainnya') DEFAULT 'lainnya',
  lokasi VARCHAR(200),
  tanggal_mulai DATETIME NOT NULL,
  tanggal_selesai DATETIME,
  kuota INT DEFAULT 0,
  poster_url VARCHAR(500) DEFAULT NULL,
  status ENUM('draft', 'published', 'selesai', 'dibatalkan') DEFAULT 'published',
  dibuat_oleh INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dibuat_oleh) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS peserta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  status_kehadiran ENUM('terdaftar', 'hadir', 'batal') DEFAULT 'terdaftar',
  tanggal_daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_daftar (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS notifikasi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  judul VARCHAR(200) NOT NULL,
  pesan TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  event_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- Akun admin default (password: admin123, sudah di-hash bcrypt)
-- Hash akan digenerate ulang saat seed.js dijalankan
