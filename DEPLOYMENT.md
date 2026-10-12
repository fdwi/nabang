# Panduan Deployment, Keamanan, dan Pemulihan DwiSave

Dokumen ini berisi panduan teknis untuk deployment ke Vercel, audit keamanan Row Level Security (RLS), prosedur backup dan pemulihan database Supabase, serta verifikasi Definition of Done (DoD) sesuai [PRD-DwiSave.md](./PRD-DwiSave.md).

---

## 1. Persiapan Supabase Production

### A. Buat Proyek Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard) dan buat proyek baru.
2. Catat **Project URL** dan **Anon / Publishable API Key** dari menu **Settings > API**.
3. **Penting:** Jangan pernah menggunakan *service_role key* atau memasukkannya ke variabel browser `NEXT_PUBLIC_*`.

### B. Terapkan Migrasi Skema Database
1. Buka menu **SQL Editor** pada dashboard Supabase.
2. Salin seluruh isi skrip [supabase/migrations/202610110001_initial_schema.sql](./supabase/migrations/202610110001_initial_schema.sql) dan jalankan (*Run*).
3. Verifikasi bahwa 8 tabel utama telah dibuat:
   - `profiles`
   - `accounts`
   - `categories`
   - `transactions`
   - `savings_goals`
   - `goal_contributions`
   - `budgets`
   - `reminders`

### C. Amankan Autentikasi (Single-Owner Hardening)
Sesuai prinsip *personal-first* (PRD Bagian 2.2):
1. Buat akun pemilik awal:
   - Buka **Authentication > Users > Add user**.
   - Masukkan alamat email dan kata sandi pemilik Anda.
2. Nonaktifkan Pendaftaran Publik:
   - Buka **Authentication > Providers > Email**.
   - Matikan (toggle off) pilihan **"Enable Sign Up"**.
   - Dengan langkah ini, tidak ada orang asing yang dapat mendaftar akun baru.
3. Jalankan template kategori bawaan:
   - Salin dan jalankan skrip [supabase/seed.sql](./supabase/seed.sql) dengan mengganti `<OWNER_USER_ID>` menggunakan UUID pemilik yang baru dibuat.

---

## 2. Deployment ke Vercel

### A. Sambungkan Repository Git
1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan pilih **Add New > Project**.
2. Impor repository Git DwiSave Anda.

### B. Konfigurasikan Environment Variables
Di pengaturan proyek Vercel, tambahkan variabel berikut pada environment **Production** dan **Preview**:

| Variabel | Nilai | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<id-proyek>.supabase.co` | URL proyek Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGci...` | Anon/Publishable API Key |
| `NEXT_PUBLIC_SITE_URL` | `https://nama-aplikasi.vercel.app` | Domain produksi Vercel |

### C. Konfigurasikan Redirect URL di Supabase
1. Buka Supabase Dashboard > **Authentication > URL Configuration**.
2. Pada **Site URL**, masukkan URL produksi Vercel Anda (misal: `https://dwisave.vercel.app`).
3. Pada **Redirect URLs**, tambahkan:
   - `https://dwisave.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (untuk pengujian lokal)

### D. Deploy
1. Klik tombol **Deploy** di Vercel.
2. Tunggu proses build selesai (rata-rata 10-30 detik).
3. Buka URL domain Vercel Anda dan uji login menggunakan akun pemilik.

---

## 3. Audit Keamanan & RLS (Row Level Security)

Seluruh tabel privat dilindungi kebijakan PostgreSQL RLS dan pemeriksaan sesi server:

1. **Isolasi Role Anonim (`anon`)**:
   - Hak akses publik telah dicabut sepenuhnya melalui perintah `REVOKE ALL ON ALL TABLES FROM anon;`.
   - Permintaan tanpa token sesi autentikasi ditolak di level database dan dialihkan ke `/login` oleh middleware.
2. **Isolasi Multi-Owner (`authenticated`)**:
   - Setiap operasi `SELECT`, `INSERT`, `UPDATE`, `DELETE` mewajibkan `user_id = auth.uid()`.
   - Foreign key komposit `(account_id, user_id)` mencegah referensi akun milik pengguna lain.
3. **Integritas Transfer Atomik**:
   - Transaksi transfer dicatat dalam baris atomik tunggal dengan pemeriksaan `destination_account_id <> account_id` dan `category_id IS NULL`.
   - Saldo antar-akun konsisten dan transfer terbukti tidak mengubah saldo gabungan.
4. **Validasi Server-Side**:
   - Semua mutasi divalidasi dengan Zod di server sebelum dieksekusi.

---

## 4. Prosedur Backup dan Pemulihan (Disaster Recovery)

### A. Backup Otomatis Supabase
- Supabase secara otomatis mencadangkan database harian (tersedia pada paket Pro).
- Status backup dapat dipantau di **Settings > Database > Backups**.

### B. Backup Manual Berkala (Menggunakan pg_dump)
Jalankan perintah berikut di terminal lokal untuk mencadangkan data secara mandiri:

```bash
pg_dump -h db.<id-proyek>.supabase.co -U postgres -d postgres -F c -b -v -f "dwisave_backup_$(date +%Y%m%d).dump"
```

### C. Prosedur Restore Database
Jika terjadi kesalahan data atau perlu melakukan pemulihan:

```bash
pg_restore -h db.<id-proyek>.supabase.co -U postgres -d postgres -v "dwisave_backup_YYYYMMDD.dump"
```

---

## 5. Checklist Definition of Done (DoD)

- [x] Aplikasi responsif dan nyaman digunakan di desktop maupun ponsel (tap target >= 44px).
- [x] Login, logout, proteksi route di middleware, dan alur callback berfungsi.
- [x] RLS aktif pada seluruh tabel; request anonim diblokir dan data privat terlindungi.
- [x] Pemasukan, pengeluaran, dan transfer bekerja secara konsisten dan atomik.
- [x] Dashboard, target tabungan, anggaran, dan laporan terhubung ke data nyata tanpa data tiruan.
- [x] Tema light, dark, dan system berfungsi dengan palet warna terkurasi.
- [x] Fitur ekspor transaksi dan laporan keuangan ke format CSV berfungsi langsung di browser.
- [x] Jadwal pengingat menabung lokal (Asia/Jakarta) berfungsi dengan filter status.
- [x] Seluruh unit test akuntansi finansial (13 skenario) lulus 100%.
- [x] Typecheck (`tsc --noEmit`), linter (`eslint .`), dan build produksi (`next build`) lulus tanpa error.
- [x] Prosedur deployment Vercel, hardening single-owner, dan disaster recovery terdokumentasi lengkap.
