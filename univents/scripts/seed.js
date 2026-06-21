// scripts/seed.js
// Jalankan dengan: npm run seed
// Membuat akun admin default supaya bisa langsung login pertama kali.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('../lib/db');

async function seed() {
  const email = 'admin@univents.id';
  const password = 'admin123';

  const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    console.log('Akun admin sudah ada, tidak dibuat ulang.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, 'admin')`,
    ['Admin UNIVENTS', email, hashed]
  );

  console.log('Akun admin berhasil dibuat:');
  console.log('  Email   :', email);
  console.log('  Password:', password);
  console.log('Segera ganti password ini setelah login pertama kali.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Gagal seed:', err);
  process.exit(1);
});
