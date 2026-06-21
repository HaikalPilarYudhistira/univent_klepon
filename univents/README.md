# UNIVENTS

Platform manajemen event kampus. Mahasiswa bisa menjelajahi dan mendaftar acara; admin bisa membuat, mengedit, dan memantau peserta acara.

## Stack

- **Frontend:** HTML/CSS/JS murni (statis, tanpa framework)
- **Backend:** Vercel Serverless Functions (Node.js)
- **Database:** MySQL-compatible serverless (rekomendasi: PlanetScale)
- **Auth:** JWT disimpan di `localStorage`

## Struktur folder

```
univents/
├── api/              Serverless functions (backend)
│   ├── auth/         login, register
│   ├── events/       CRUD acara
│   ├── peserta/      pendaftaran & kehadiran
│   ├── users/        kelola pengguna (admin)
│   └── notifikasi/   notifikasi mahasiswa
├── public/           Semua file statis yang dilayani sebagai website
│   ├── admin/        Halaman khusus admin
│   ├── mahasiswa/    Halaman khusus mahasiswa
│   ├── css/
│   └── js/
├── lib/              Helper koneksi DB & auth
├── scripts/seed.js   Membuat akun admin pertama
└── schema.sql        Struktur tabel database
```

## Setup database (PlanetScale — gratis)

1. Daftar di [planetscale.com](https://planetscale.com) dan buat database baru bernama `univents`.
2. Di dashboard PlanetScale, buka tab **Console** dan jalankan isi `schema.sql` untuk membuat semua tabel.
3. Buka tab **Settings > Passwords**, buat password baru, dan catat host, username, password yang muncul.

> Kalau lebih nyaman pakai MySQL biasa (misal di Railway atau Clever Cloud), itu juga bisa — tinggal sesuaikan `DB_HOST`, `DB_USER`, dst. Pastikan koneksi mendukung SSL kalau hostingnya mewajibkan.

## Setup lokal

```bash
npm install
cp .env.example .env
# isi .env dengan kredensial database kamu

npm run seed   # membuat akun admin pertama (admin@univents.id / admin123)
```

Untuk menjalankan secara lokal dengan serverless functions aktif, install Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

Lalu buka `http://localhost:3000`.

## Deploy ke Vercel

1. Push project ini ke GitHub.
2. Di [vercel.com](https://vercel.com), klik **New Project** dan pilih repo ini.
3. Saat konfigurasi, buka **Environment Variables** dan isi semua variabel dari `.env.example` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL, JWT_SECRET).
4. Klik **Deploy**.
5. Setelah deploy selesai, jalankan seed sekali untuk membuat akun admin:
   ```bash
   vercel env pull .env   # menarik env production ke lokal
   npm run seed
   ```

## Akun default setelah seed

```
Email   : admin@univents.id
Password: admin123
```

**Ganti password ini setelah login pertama kali** — saat ini belum ada halaman ganti password, jadi untuk sementara ubah langsung lewat database kalau perlu, atau saya bisa tambahkan halaman itu di iterasi berikutnya.

## Alur penggunaan

**Mahasiswa:** daftar di `/mahasiswa/register.html` → login → lihat & daftar acara di `/mahasiswa/events.html` → cek notifikasi di `/mahasiswa/notifikasi.html`.

**Admin:** login dengan akun admin di `/mahasiswa/login.html` (form login sama untuk admin & mahasiswa, dibedakan otomatis lewat role) → diarahkan ke `/admin/dashboard.html` → kelola acara, peserta, dan pengguna dari sidebar.

## Yang belum ada (next steps)

- Upload poster acara langsung (sekarang baru lewat URL)
- Halaman ubah password
- Reset password lewat email
- Export daftar peserta ke Excel/PDF
