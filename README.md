# DwiSave

Aplikasi web tabungan dan pengelolaan keuangan pribadi. Implementasi sedang dikerjakan bertahap berdasarkan [PRD-DwiSave.md](./PRD-DwiSave.md).

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env.local`.
2. Buat proyek Supabase, lalu isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Jangan memasukkan service role key ke variabel `NEXT_PUBLIC_*`.
3. Terapkan [migration awal](./supabase/migrations/202610110001_initial_schema.sql) melalui Supabase CLI atau SQL Editor pada database baru.
4. Di Supabase Auth, buat akun pemilik awal lalu nonaktifkan pendaftaran publik. Tambahkan `http://localhost:3000/auth/callback` ke Redirect URLs bila menggunakan alur callback.
5. Instal dependensi dengan `npm install`.
6. Jalankan `npm run dev` lalu buka `http://localhost:3000`.

## Pemeriksaan

```bash
npm run lint
npm run typecheck
npm run build
```

## Status implementasi

- Tahap 1 (Fondasi Proyek): Fondasi Next.js, tema light/dark/system, struktur halaman, navigasi responsif, dan konfigurasi environment.
- Tahap 2 (Database dan Auth): Migrasi database Supabase lengkap dengan RLS, TypeScript database types, helper Supabase SSR, proteksi route di middleware, login dan callback, serta manajemen profil dan logout di pengaturan.
- Tahap 3 (Akun dan Transaksi): CRUD akun dan kategori, pencatatan transaksi pemasukan/pengeluaran/transfer atomik, perhitungan saldo berjalan, filter riwayat, pencarian catatan, ekspor CSV, dan unit test perhitungan saldo.
- Tahap 4 (Dashboard): Ringkasan total saldo riil, arus kas berkala, grafik SVG perbandingan pemasukan vs pengeluaran 6 bulan terakhir, alokasi saldo akun, transaksi terkini, filter periode, dan tombol aksi cepat.
- Tahap 5 (Target dan Anggaran): CRUD target tabungan, kontribusi setoran/penarikan terhubung ke saldo akun, perhitungan progres dan sisa target, penetapan batas anggaran bulanan per kategori, sistem peringatan ambang batas 80% dan 100%, serta unit test.
- Tahap 6 (Pengingat, Laporan, dan Fitur Lanjutan): CRUD jadwal pengingat menabung dengan frekuensi fleksibel (waktu lokal Asia/Jakarta), analisis laporan keuangan dengan filter periode dan akun, rincian pengeluaran per kategori, rasio tabungan, serta ekspor CSV laporan keuangan.
- Tahap 7 (Selesai): QA, Audit Keamanan RLS, dan Kesiapan Deployment. Panduan deployment lengkap, langkah hardening single-owner, serta prosedur disaster recovery tersedia di [DEPLOYMENT.md](./DEPLOYMENT.md).


