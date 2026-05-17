# BidSmart - Aplikasi Lelang Online

> Final Project SBD — Sistem lelang online sederhana untuk praktik basis data dan full-stack.

## Deskripsi

`BidSmart` adalah aplikasi lelang online yang menampilkan fungsionalitas autentikasi, pembuatan lelang, penawaran (bids), pelacakan saldo (available & hold), transaksi finansial sederhana, dan watchlist. Proyek ini dibuat sebagai tugas akhir mata kuliah Sistem Basis Data (SBD) dan berisi contoh implementasi backend (Node.js + Express), frontend (React + Vite), serta dump basis data siap pakai.

**Catatan penting:** dump basis data resmi disertakan di file `dump_bidsmart.sql` di root repository.

## Fitur Utama

- Otentikasi pengguna dengan hashing password (bcrypt)
- Pembuatan dan pengelolaan lelang
- Melakukan penawaran (bidding) dan riwayat penawaran
- Saldo pengguna: `available` dan `hold` untuk mengelola dana yang sedang digunakan dalam lelang
- Transaksi keuangan dasar untuk top-up dan penarikan (simulasi)
- Watchlist untuk memantau lelang favorit

## Link Live

- Demo (deployed): https://final-project-sbd-g2on.vercel.app

## Struktur Proyek (ringkasan)

- `backend/` — server Express, koneksi database, API routes
- `frontend/` — aplikasi React + Vite
- `dump_bidsmart.sql` — file dump database (schema + data)

## Persyaratan

- Node.js v16+ dan npm
- PostgreSQL (atau akses ke server Postgres untuk mengimpor `dump_bidsmart.sql`)
- (Opsional) Redis untuk caching/session jika dikonfigurasi

## Menjalankan Secara Lokal

Ikuti langkah di bawah untuk menjalankan aplikasi secara lokal (backend + frontend).

### 1. Clone repository

```bash
git clone <repo-url>
cd Finpro_SBD_Kelompok9-main
```

### 2. Siapkan basis data

Pastikan PostgreSQL terpasang dan sedang berjalan. Buat database baru (mis. `bidsmart`) lalu impor dump:

```bash
# contoh menggunakan psql
createdb bidsmart
psql -d bidsmart -f dump_bidsmart.sql
```

Sesuaikan nama database, user, dan password sesuai lingkungan Anda.

### 3. Konfigurasi Backend

Masuk ke direktori `backend` lalu buat file `.env` berdasarkan contoh di bawah:

```env
# contoh .env
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=bidsmart
DB_PORT=5432
JWT_SECRET=isi_rahasia_jwt
REDIS_URL=redis://localhost:6379
```

Catatan: file `backend/package.json` saat ini tidak menyediakan script `start`. Jalankan server dengan:

```bash
cd backend
npm install
node server.js
```

Atau tambahkan script `start` pada `backend/package.json` seperti:

```json
"scripts": {
  "start": "node server.js"
}
```

Kemudian jalankan `npm start`.

### 4. Konfigurasi Frontend

Masuk ke `frontend` dan jalankan:

```bash
cd frontend
npm install
npm run dev
```

Frontend default akan berjalan di `http://localhost:5173` (Vite). Sesuaikan apabila port berbeda.

## Endpoints dan Environment (ringkasan)

- Backend utama: `server.js` di folder `backend/`
- Pastikan variabel `.env` terisi dengan benar: koneksi Postgres, `JWT_SECRET`, dan (opsional) `REDIS_URL`.

## Impor Data (opsional)

Jika ingin mengosongkan dan mengimpor ulang data, gunakan:

```bash
psql -d bidsmart -f dump_bidsmart.sql
```

## Troubleshooting Singkat

- Jika server backend tidak menyala, periksa `DB_*` env vars dan koneksi ke Postgres.
- Jika frontend tidak memuat, jalankan `npm run dev` di `frontend` dan lihat console untuk kesalahan bundling.

## Kontribusi

1. Fork repository
2. Buat branch fitur: `git checkout -b feat/nama-fitur`
3. Commit perubahan dan push
4. Buka Pull Request dengan deskripsi perubahan

Untuk perubahan besar pada struktur database, sertakan skrip migrasi atau instruksi impor yang jelas.

## Maintainer

- Tim Pengembang: Kelompok 9 — Final Project SBD
- Repo & Deployment: dikelola oleh tim proyek

Jika Anda butuh bantuan lebih lanjut, buka isu di repository atau hubungi pemelihara proyek.

---
File dump resmi: `dump_bidsmart.sql` (terletak di root repository)
