# DwiSave — Product Requirements Document (PRD)

**Versi:** 1.0  
**Tanggal:** Oktober 2026  
**Status:** Draft untuk implementasi  
**Produk:** Web app tabungan dan pengelolaan keuangan pribadi  
**Nama sementara:** DwiSave

---

## 1. Ringkasan Produk

DwiSave adalah web app keuangan pribadi untuk mencatat pemasukan, pengeluaran, perpindahan saldo antar-akun, target tabungan, anggaran bulanan, serta pengingat menabung. Aplikasi ditujukan untuk satu pemilik akun dan dapat diakses melalui desktop maupun perangkat mobile.

### 1.1 Tujuan

- Menampilkan kondisi keuangan pribadi dalam satu dashboard.
- Mencatat transaksi dan menghitung saldo berdasarkan riwayat transaksi.
- Membantu pengguna merencanakan dan mencapai target tabungan.
- Mengendalikan pengeluaran melalui anggaran kategori.
- Menyediakan laporan dan riwayat transaksi yang dapat difilter.
- Menjaga kerahasiaan data dengan autentikasi dan Row Level Security (RLS).

### 1.2 Prinsip Produk

- **Personal-first:** dirancang untuk satu pemilik akun.
- **Privacy-first:** semua data keuangan bersifat privat.
- **Mobile-first:** nyaman digunakan dari ponsel dan desktop.
- **Manual-first:** pengguna mencatat transaksi sendiri; tidak ada koneksi bank otomatis.
- **Consistent accounting:** transfer antar-akun tidak dihitung sebagai pemasukan atau pengeluaran gabungan.
- **No fake balances:** saldo berasal dari saldo awal dan mutasi transaksi yang tersimpan.

### 1.3 Batasan

DwiSave bukan bank, dompet digital, layanan pembayaran, atau aplikasi investasi. Aplikasi hanya mencatat dan merencanakan keuangan. Saldo aplikasi tidak otomatis sama dengan saldo aktual rekening bank.

---

## 2. Pengguna dan Hak Akses

### 2.1 Pengguna Utama

Satu pemilik akun yang mengelola seluruh data keuangan pribadi.

### 2.2 Model Akses

- Pengguna harus login untuk membuka seluruh halaman aplikasi yang bersifat privat.
- Registrasi publik hanya digunakan saat menyiapkan akun awal, lalu dinonaktifkan.
- Semua data bisnis memiliki `user_id` dan diproteksi RLS.
- Jangan mengandalkan penyembunyian UI sebagai kontrol keamanan; pemeriksaan sesi, otorisasi server, dan RLS wajib dilakukan.

---

## 3. Teknologi

| Lapisan | Teknologi | Fungsi |
|---|---|---|
| Frontend dan routing | Next.js App Router | UI, routing, rendering |
| Bahasa | TypeScript | Type safety |
| Styling | Tailwind CSS | Layout responsif dan tema |
| Komponen UI | shadcn/ui | Dialog, form, tabel, navigasi |
| Backend aplikasi | Server Actions dan/atau Route Handlers | Mutasi data dan operasi server |
| Validasi | Zod | Validasi input di server |
| Database | Supabase PostgreSQL | Penyimpanan relasional |
| Autentikasi | Supabase Auth | Login dan manajemen sesi |
| Keamanan data | PostgreSQL RLS | Isolasi data pemilik |
| Grafik | Recharts | Grafik pemasukan, pengeluaran, dan progres |
| Ikon | Lucide | Ikon antarmuka |
| Unit testing | Vitest dan Testing Library | Uji logika dan komponen |
| End-to-end testing | Playwright | Uji alur aplikasi |
| Hosting | Vercel | Build dan deployment |

Gunakan versi paket yang stabil dan saling kompatibel saat proyek dibuat. Jangan mengunci versi lama tanpa alasan.

---

## 4. Ruang Lingkup MVP

### 4.1 Fitur Wajib

1. Login, logout, dan proteksi halaman privat.
2. Dashboard saldo dan ringkasan bulanan.
3. CRUD transaksi pemasukan, pengeluaran, dan transfer.
4. Manajemen akun: tunai, rekening bank, e-wallet, dan lainnya.
5. Kategori transaksi.
6. Target tabungan dan kontribusi target.
7. Anggaran bulanan per kategori.
8. Pengingat menabung dengan jadwal harian, mingguan, atau bulanan.
9. Laporan dan filter periode.
10. Tema light, dark, dan system.
11. Ekspor transaksi ke CSV.
12. Tampilan responsif desktop dan mobile.
13. Validasi server dan RLS untuk seluruh data pengguna.

### 4.2 Tidak Termasuk MVP

- Integrasi rekening bank atau e-wallet otomatis.
- Transfer uang atau pemrosesan pembayaran nyata.
- OCR struk.
- AI financial advisor.
- Multiuser, keluarga, atau kolaborasi.
- Aplikasi native Android/iOS.
- Investasi, pinjaman, dan perhitungan pajak.
- Pengiriman WhatsApp/SMS berbayar.

### 4.3 Fitur Pengingat Bertahap

- **MVP:** pengingat tersimpan dan ditampilkan dalam aplikasi saat pengguna membukanya.
- **Tahap lanjutan:** browser notification dengan izin pengguna.
- **Tahap lanjutan:** notifikasi terjadwal via Vercel Cron atau scheduler lain, ditambah provider email/push jika diperlukan.

Jangan menjanjikan notifikasi tepat waktu ketika browser ditutup kecuali mekanisme server-side dan pengiriman notifikasinya benar-benar sudah dibuat dan diuji.

---

## 5. Navigasi dan Rancangan Halaman

### 5.1 Navigasi Utama

1. Dashboard
2. Transaksi
3. Akun & Saldo
4. Target Tabungan
5. Anggaran
6. Laporan
7. Pengingat
8. Pengaturan

Desktop menggunakan sidebar dan header. Mobile menggunakan bottom navigation untuk menu utama, serta tombol tambah transaksi yang mudah dijangkau.

### 5.2 Dashboard

Menampilkan:

- Total saldo seluruh akun aktif.
- Total pemasukan pada periode yang dipilih.
- Total pengeluaran pada periode yang dipilih.
- Selisih pemasukan dan pengeluaran.
- Ringkasan saldo atau alokasi tabungan.
- Grafik pemasukan vs pengeluaran.
- Progres target tabungan.
- Penggunaan anggaran kategori.
- Transaksi terbaru.
- Tombol cepat tambah transaksi dan target.

Semua angka dashboard harus dihitung dari data database, bukan angka hardcoded. Tampilkan empty state ketika belum ada transaksi.

### 5.3 Transaksi

Fungsi:

- Tambah, edit, hapus, lihat detail.
- Cari berdasarkan catatan.
- Filter jenis, akun, kategori, dan rentang tanggal.
- Urutkan berdasarkan tanggal terbaru atau nominal.
- Pagination jika daftar panjang.
- Ekspor hasil yang difilter ke CSV.

Form transaksi:

- Jenis: pemasukan, pengeluaran, atau transfer.
- Nominal.
- Akun sumber.
- Akun tujuan untuk transfer.
- Kategori untuk pemasukan/pengeluaran.
- Tanggal dan waktu.
- Catatan opsional.

### 5.4 Akun & Saldo

Fungsi:

- Membuat dan mengubah akun.
- Tipe akun: tunai, bank, e-wallet, lainnya.
- Saldo awal.
- Menampilkan saldo berjalan yang dihitung dari saldo awal dan mutasi.
- Menonaktifkan akun tanpa menghilangkan riwayat.
- Mencegah penghapusan akun yang masih memiliki transaksi, kecuali ada alur arsip/migrasi yang aman.

### 5.5 Target Tabungan

Setiap target memiliki:

- Nama.
- Nominal target.
- Saldo awal target bila diperlukan.
- Tanggal target opsional.
- Status: active, completed, paused, cancelled.
- Warna/ikon opsional.
- Riwayat setoran dan penarikan target.

Tampilkan nominal terkumpul, nominal tersisa, persentase progres, dan estimasi setoran berkala yang dibutuhkan jika tanggal target tersedia.

Kontribusi target yang memindahkan uang harus terkait dengan mutasi transaksi agar saldo target tidak berbeda dari saldo akun. Hindari pencatatan ganda.

### 5.6 Anggaran

- Anggaran bulanan per kategori pengeluaran.
- Periode disimpan sebagai tanggal hari pertama bulan.
- Menampilkan batas, pengeluaran aktual, sisa anggaran, dan persentase penggunaan.
- Beri peringatan pada 80%, 100%, dan lebih dari 100%.
- Pengeluaran di atas anggaran boleh disimpan, tetapi pengguna mendapat peringatan.
- Transfer tidak dihitung sebagai pengeluaran kategori.

### 5.7 Laporan

- Ringkasan bulanan.
- Grafik pemasukan dan pengeluaran.
- Pengeluaran per kategori.
- Tren saldo berdasarkan periode.
- Filter periode dan akun.
- Ekspor CSV.

Pastikan laporan tidak menghitung transfer sebagai pemasukan/pengeluaran gabungan. Semua agregasi harus menggunakan query atau fungsi yang konsisten dengan aturan bisnis.

### 5.8 Pengingat

- Judul pengingat.
- Nominal opsional.
- Frekuensi: harian, mingguan, bulanan.
- Waktu lokal `Asia/Jakarta`.
- Hari dalam minggu/bulan jika relevan.
- Aktif/nonaktif.
- Waktu pengingat berikutnya.
- Riwayat pengingat terkirim bila pengiriman server-side ditambahkan.

Tangani tanggal bulanan yang tidak tersedia, misalnya tanggal 31 pada bulan yang hanya memiliki 30 hari.

### 5.9 Pengaturan

- Nama tampilan.
- Tema: light, dark, system.
- Mata uang: IDR.
- Zona waktu: `Asia/Jakarta`.
- Pengelolaan keamanan akun.
- Ekspor data.
- Logout.

---

## 6. UI/UX dan Design System

### 6.1 Arah Visual

Gunakan gaya modern, minimalis, profesional, dan fokus pada keterbacaan angka.

**Dark mode**
- Latar navy/charcoal.
- Kartu dengan kontras halus.
- Aksen emerald untuk aksi positif.
- Teks utama putih dan teks sekunder abu-abu kebiruan.

**Light mode**
- Latar putih atau abu-abu sangat terang.
- Kartu putih dengan border lembut.
- Aksen emerald.
- Teks utama charcoal.

### 6.2 Prinsip UX

- Responsif pada lebar mobile, tablet, dan desktop.
- Gunakan format Rupiah Indonesia, misalnya `Rp1.250.000`.
- Form memiliki label jelas dan pesan kesalahan yang spesifik.
- Dialog konfirmasi untuk penghapusan transaksi.
- Loading, empty, success, dan error state tersedia.
- Jangan mengandalkan warna saja untuk membedakan pemasukan/pengeluaran.
- Dukungan keyboard, focus state, dan kontras yang memadai.
- Grafik harus memiliki label/tooltip yang mudah dipahami.
- Jangan menampilkan angka ilustrasi sebagai data nyata.

### 6.3 Tema

Simpan preferensi tema pada browser untuk penerapan instan, dan sinkronkan ke profil bila diperlukan. Pilihan pengguna harus mengalahkan preferensi sistem. Cegah flash tema yang salah saat halaman dimuat.

---

## 7. Aturan Bisnis dan Perhitungan

### 7.1 Rumus Saldo Akun

`Saldo akun = saldo awal + pemasukan - pengeluaran + transfer masuk - transfer keluar`

Saldo sebaiknya dihitung dari sumber data transaksi, bukan diubah manual pada setiap form. Jika cache saldo/materialized view dipakai kelak, harus ada mekanisme rekonsiliasi.

### 7.2 Rumus Saldo Gabungan

`Saldo gabungan = jumlah saldo semua akun yang termasuk dalam ringkasan`

Transfer antar-akun milik sendiri tidak mengubah saldo gabungan dan tidak masuk kategori pemasukan atau pengeluaran.

### 7.3 Rumus Target

`Saldo target = saldo awal target + setoran target - penarikan target`

`Progres (%) = min(100, saldo target / nominal target × 100)`

Nominal tersisa tidak boleh negatif. Jika saldo target melebihi target, progres ditampilkan maksimum 100% dan kelebihannya tetap terlihat sebagai nominal.

### 7.4 Validasi Transaksi

- Nominal wajib lebih besar dari nol.
- Nominal harus valid dan tidak melebihi kapasitas kolom.
- Tanggal harus valid.
- Akun harus dimiliki pengguna dan aktif untuk transaksi baru.
- Kategori harus dimiliki pengguna dan sesuai tipe transaksi.
- Transfer membutuhkan akun tujuan yang berbeda dari akun sumber.
- Transfer tidak memiliki kategori pemasukan/pengeluaran.
- Secara default, transaksi tidak boleh membuat saldo akun negatif.
- Edit dan hapus transaksi harus memperbarui seluruh perhitungan yang terkait.
- Gunakan operasi database atomik untuk transfer dan operasi multi-record.
- Gunakan idempotency key atau mekanisme sejenis pada mutasi yang berpotensi dikirim ulang.
- Pengeluaran yang melewati anggaran tetap diperbolehkan dengan peringatan.

### 7.5 Ketepatan Data

- Simpan nominal sebagai `numeric`, bukan floating point.
- Simpan waktu transaksi sebagai `timestamptz`.
- Gunakan `Asia/Jakarta` untuk menampilkan dan menghitung periode lokal.
- Hindari mengandalkan jam perangkat sebagai satu-satunya sumber waktu.
- Semua ringkasan harus bisa direkonsiliasi dengan riwayat transaksi.

---

## 8. Skema Database Supabase

### 8.1 Tabel

| Tabel | Kegunaan |
|---|---|
| `profiles` | Preferensi dan profil pengguna |
| `accounts` | Akun penyimpanan uang |
| `categories` | Kategori pemasukan/pengeluaran |
| `transactions` | Mutasi uang |
| `savings_goals` | Target tabungan |
| `goal_contributions` | Setoran/penarikan target |
| `budgets` | Anggaran kategori bulanan |
| `reminders` | Jadwal pengingat |

Semua tabel bisnis memakai `user_id` yang terhubung ke `auth.users(id)`. Gunakan foreign key komposit untuk memastikan relasi antardata tidak lintas-pemilik.

### 8.2 SQL Fondasi

Jalankan melalui Supabase SQL Editor pada proyek baru. Skrip ini merupakan fondasi skema dan kebijakan RLS, bukan keseluruhan logika produksi. Sebelum digunakan dengan data nyata, tambahkan trigger profil dan `updated_at`, validasi kategori bertipe tepat, transaksi atomik, dan kebijakan penghapusan yang sesuai.

```sql
create type public.transaction_type as enum ('income', 'expense', 'transfer');
create type public.category_type as enum ('income', 'expense');
create type public.goal_status as enum ('active', 'completed', 'paused', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  theme text not null default 'system'
    check (theme in ('light', 'dark', 'system')),
  currency text not null default 'IDR' check (currency = 'IDR'),
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  account_type text not null
    check (account_type in ('cash', 'bank', 'ewallet', 'other')),
  opening_balance numeric(14,2) not null default 0
    check (opening_balance >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  type public.category_type not null,
  color text,
  icon text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, user_id, type)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  type public.transaction_type not null,
  amount numeric(14,2) not null check (amount > 0),
  account_id uuid not null,
  destination_account_id uuid,
  category_id uuid,
  description text check (description is null or length(description) <= 500),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  foreign key (account_id, user_id)
    references public.accounts(id, user_id),
  foreign key (destination_account_id, user_id)
    references public.accounts(id, user_id),

  check (
    (type = 'transfer'
      and destination_account_id is not null
      and destination_account_id <> account_id
      and category_id is null)
    or
    (type in ('income', 'expense')
      and destination_account_id is null
      and category_id is not null)
  )
);

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  target_amount numeric(14,2) not null check (target_amount > 0),
  initial_amount numeric(14,2) not null default 0 check (initial_amount >= 0),
  deadline date,
  status public.goal_status not null default 'active',
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  goal_id uuid not null,
  transaction_id uuid,
  amount numeric(14,2) not null check (amount > 0),
  contribution_type text not null
    check (contribution_type in ('deposit', 'withdrawal')),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (goal_id, user_id)
    references public.savings_goals(id, user_id),
  foreign key (transaction_id, user_id)
    references public.transactions(id, user_id)
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  category_id uuid not null,
  month date not null check (extract(day from month) = 1),
  limit_amount numeric(14,2) not null check (limit_amount > 0),
  created_at timestamptz not null default now(),
  foreign key (category_id, user_id)
    references public.categories(id, user_id),
  unique (user_id, category_id, month)
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 100),
  amount numeric(14,2) check (amount is null or amount > 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  reminder_time time not null default '19:00',
  day_of_week smallint check (day_of_week between 0 and 6),
  day_of_month smallint check (day_of_month between 1 and 31),
  next_reminder_at timestamptz,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create index transactions_user_date_idx
  on public.transactions (user_id, occurred_at desc);
create index transactions_account_idx
  on public.transactions (account_id, occurred_at desc);
create index goals_user_status_idx
  on public.savings_goals (user_id, status);
create index contributions_goal_date_idx
  on public.goal_contributions (goal_id, occurred_at desc);
create index budgets_user_month_idx
  on public.budgets (user_id, month);
create index reminders_due_idx
  on public.reminders (next_reminder_at) where is_enabled = true;

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.savings_goals enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.budgets enable row level security;
alter table public.reminders enable row level security;

create policy "profile_owner_all" on public.profiles
  for all using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "accounts_owner_all" on public.accounts
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "categories_owner_all" on public.categories
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "transactions_owner_all" on public.transactions
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "goals_owner_all" on public.savings_goals
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "contributions_owner_all" on public.goal_contributions
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "budgets_owner_all" on public.budgets
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "reminders_owner_all" on public.reminders
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.profiles, public.accounts, public.categories,
  public.transactions, public.savings_goals, public.goal_contributions,
  public.budgets, public.reminders from anon;

grant select, insert, update, delete on public.profiles, public.accounts,
  public.categories, public.transactions, public.savings_goals,
  public.goal_contributions, public.budgets, public.reminders to authenticated;
```

### 8.3 Pekerjaan Database Sebelum Production

1. Tambahkan trigger `updated_at`.
2. Tambahkan trigger pembuatan profil atau alur pembuatan profil yang aman.
3. Validasi bahwa `category_id` adalah kategori milik pengguna yang sama dan jenisnya sesuai transaksi.
4. Pastikan akun sumber dan tujuan transfer aktif.
5. Terapkan validasi saldo nonnegatif secara atomik di database, bukan hanya di UI.
6. Implementasikan fungsi database untuk transfer atomik dan rollback jika salah satu langkah gagal.
7. Pastikan kontribusi target terkait dengan transaksi yang sesuai dan tidak bisa digandakan.
8. Tentukan kebijakan penghapusan transaksi dan target agar histori tetap konsisten.
9. Tambahkan batas panjang input dan validasi enum untuk seluruh data yang dapat ditulis pengguna.
10. Gunakan migration versioned di `supabase/migrations`; jangan mengandalkan SQL Editor sebagai satu-satunya catatan perubahan.

**Peringatan:** skrip ini bukan idempoten. Jalankan pada database baru atau ubah menjadi migration yang terkelola sebelum menerapkannya pada database yang sudah ada.

---

## 9. Row Level Security (RLS)

### 9.1 Kebijakan

Setiap tabel privat hanya mengizinkan operasi terhadap baris dengan `user_id = auth.uid()`. Untuk `profiles`, gunakan `id = auth.uid()`.

- Aktifkan RLS pada semua tabel bisnis.
- Berikan hak akses SQL hanya pada role yang diperlukan.
- `anon` tidak boleh membaca atau mengubah data finansial.
- Jangan menaruh Supabase service role/secret key di browser.
- Jangan menonaktifkan RLS untuk menyelesaikan error UI.
- Validasi foreign key lintas-pemilik dan jenis kategori.
- Uji kebijakan dengan akun pemilik dan sesi anonim.

RLS harus menjadi lapisan pertahanan tambahan bersama pemeriksaan sesi server. Karena aplikasi ini satu pengguna, registrasi publik dinonaktifkan setelah akun awal dibuat, tetapi RLS tetap wajib.

---

## 10. Autentikasi dan Sesi

- Gunakan Supabase Auth.
- Login melalui email/password atau magic link.
- Verifikasi email jika menggunakan password.
- Tangani callback OAuth/magic link di route yang sesuai bila metode tersebut dipilih.
- Gunakan pola integrasi SSR Supabase yang sesuai dengan versi library saat implementasi.
- Sinkronkan session/cookies dengan benar pada server dan browser.
- Redirect pengguna belum login ke `/login`.
- Redirect pengguna yang sudah login dari halaman login ke dashboard.
- Sediakan logout yang mengakhiri sesi.
- Nonaktifkan sign-up publik setelah akun pemilik berhasil dibuat.
- Gunakan pesan kesalahan login yang tidak membocorkan informasi sensitif.
- Terapkan rate limiting/proteksi brute force melalui konfigurasi yang tersedia.

---

## 11. Keamanan dan Privasi

- Semua komunikasi harus menggunakan HTTPS.
- Simpan secret hanya di environment variables server.
- Jangan commit `.env.local`.
- Commit `.env.example` tanpa nilai rahasia.
- Gunakan Zod di server untuk seluruh mutasi.
- Periksa otorisasi setiap record sebelum edit/hapus.
- Hindari log yang berisi nominal, catatan transaksi, token, atau data sensitif.
- Jangan menaruh data finansial pada URL atau metadata publik.
- Gunakan dependensi yang dipelihara dan audit dependensi.
- Siapkan backup database dan uji restore secara berkala.
- Tetapkan kebijakan retensi data dan prosedur ekspor/penghapusan.
- Lindungi endpoint cron dengan secret yang diverifikasi di server.
- Jangan menggunakan service role key untuk permintaan browser.

---

## 12. Environment Variables

Contoh `.env.example`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Gunakan nama variabel secara konsisten di seluruh aplikasi. URL situs produksi diisi dengan domain Vercel yang aktif.

Jika benar-benar membutuhkan secret key untuk tugas administratif server-side, gunakan variabel server-only tanpa awalan `NEXT_PUBLIC_`, batasi penggunaannya, dan jangan menggunakannya untuk request pengguna biasa yang seharusnya mengikuti RLS.

---

## 13. Deployment

### 13.1 Persiapan

1. Buat proyek Supabase.
2. Buat repository Git.
3. Buat proyek Next.js dengan TypeScript, App Router, Tailwind, dan ESLint.
4. Tambahkan dependensi Supabase SSR/client, Zod, shadcn/ui, Recharts, Lucide, serta test tooling.
5. Buat migration database dan jalankan pada proyek Supabase development.
6. Konfigurasikan environment variables lokal.
7. Jalankan lint, typecheck, test, dan build.

### 13.2 Deploy Vercel

1. Impor repository GitHub ke Vercel.
2. Tambahkan environment variables untuk development/preview/production sesuai kebutuhan.
3. Deploy aplikasi.
4. Tambahkan URL Vercel ke konfigurasi URL Supabase Auth.
5. Konfigurasikan redirect URL callback yang benar.
6. Uji login, logout, refresh session, dan seluruh operasi CRUD.
7. Pastikan data tetap ada setelah redeploy.
8. Uji akses tanpa login dan pastikan data privat tidak dapat diakses.

Pisahkan proyek database development dan production bila memungkinkan. Gunakan migrations yang tersimpan di Git agar perubahan skema dapat dilacak.

---

## 14. Struktur Folder

```text
dwisave/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── accounts/
│   │   │   ├── goals/
│   │   │   ├── budgets/
│   │   │   ├── reports/
│   │   │   ├── reminders/
│   │   │   └── settings/
│   │   ├── auth/
│   │   │   └── callback/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── accounts/
│   │   ├── goals/
│   │   ├── budgets/
│   │   └── charts/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── validations/
│   │   ├── finance/
│   │   ├── formatters/
│   │   └── utils.ts
│   ├── actions/
│   ├── hooks/
│   └── types/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Struktur dapat berkembang selama implementasi. Jangan membuat banyak file kosong sebelum diperlukan.

---

## 15. Pengujian dan Acceptance Criteria

### 15.1 Autentikasi

- Pengguna belum login tidak bisa membuka dashboard atau halaman privat.
- Pengguna dapat login dan logout.
- Session tetap berfungsi setelah refresh.
- Callback login ditangani dengan benar.
- Sign-up publik dinonaktifkan setelah akun pemilik tersedia.

### 15.2 Transaksi dan Saldo

- Pemasukan menambah saldo akun.
- Pengeluaran mengurangi saldo akun.
- Transfer mengurangi akun sumber dan menambah akun tujuan secara atomik.
- Transfer tidak mengubah saldo gabungan.
- Nominal nol/negatif ditolak.
- Kategori salah tipe ditolak.
- Akun milik pengguna lain tidak dapat digunakan.
- Edit dan hapus transaksi memperbarui saldo dan laporan.
- Saldo tidak menjadi negatif akibat operasi bersamaan.
- Mutasi yang dikirim ulang tidak membuat duplikasi.

### 15.3 Target dan Anggaran

- Progres target sesuai kontribusi tersimpan.
- Kontribusi tidak bisa tercatat dua kali.
- Anggaran menghitung hanya pengeluaran kategori pada bulan terkait.
- Transfer tidak dihitung sebagai pengeluaran.
- Peringatan muncul pada ambang anggaran yang ditetapkan.
- Periode bulanan mengikuti `Asia/Jakarta`.

### 15.4 UI

- Layout berfungsi pada ponsel dan desktop.
- Light, dark, dan system theme bekerja.
- Loading, empty, success, dan error state tersedia.
- Form memiliki validasi dan pesan yang jelas.
- Nominal ditampilkan dengan format Rupiah.
- Grafik tidak menampilkan data hardcoded saat production.

### 15.5 Keamanan

- RLS aktif di seluruh tabel privat.
- Request anonim tidak dapat membaca data keuangan.
- Akses record pengguna lain ditolak.
- Tidak ada secret di client bundle atau repository.
- Operasi multi-record menggunakan transaksi database yang atomik.

---

## 16. Rencana Implementasi Bertahap

### Tahap 1 — Fondasi Proyek

- Inisialisasi Next.js dan TypeScript.
- Konfigurasi Tailwind dan shadcn/ui.
- Buat layout, sidebar, header, dan responsive navigation.
- Siapkan konfigurasi Supabase server/client.
- Buat `.env.example` dan README.
- Pastikan lint, typecheck, dan build berhasil.

**Selesai jika:** aplikasi berjalan lokal dan struktur UI utama tersedia.

### Tahap 2 — Database dan Auth

- Buat migration seluruh tabel.
- Aktifkan RLS dan policies.
- Buat helper Supabase SSR.
- Buat halaman login dan callback.
- Proteksi route privat.
- Siapkan pembuatan akun pemilik dan nonaktifkan registrasi publik.

**Selesai jika:** hanya pemilik yang dapat login dan data privat terlindungi.

### Tahap 3 — Akun dan Transaksi

- CRUD akun dan kategori.
- Form pemasukan/pengeluaran.
- Transfer atomik.
- Riwayat, pencarian, filter, pagination.
- Validasi Zod di server.
- Unit test untuk perhitungan saldo.

**Selesai jika:** saldo dan mutasi konsisten pada semua skenario utama.

### Tahap 4 — Dashboard

- Query ringkasan periode.
- Grafik pemasukan dan pengeluaran.
- Ringkasan akun dan transaksi terakhir.
- Empty/loading/error state.
- Filter periode.

**Selesai jika:** semua angka berasal dari database dan dapat direkonsiliasi.

### Tahap 5 — Target dan Anggaran

- CRUD target tabungan.
- Kontribusi target yang terhubung ke transaksi.
- CRUD anggaran per bulan dan kategori.
- Peringatan penggunaan anggaran.
- Pengujian konsistensi target dan anggaran.

**Selesai jika:** tidak ada penghitungan ganda atau saldo target yang tidak konsisten.

### Tahap 6 — Pengingat, Laporan, dan Tema

- CRUD pengingat.
- Tampilan pengingat di aplikasi.
- Laporan dan ekspor CSV.
- Light/dark/system theme.
- Sinkronisasi preferensi jika diperlukan.

**Selesai jika:** pengingat dan laporan bekerja dengan benar untuk periode lokal.

### Tahap 7 — QA dan Deployment

- Jalankan unit test dan Playwright.
- Audit RLS.
- Uji kasus transaksi bersamaan.
- Periksa responsivitas dan aksesibilitas.
- Deploy ke Vercel.
- Uji callback Supabase Auth dan environment production.
- Dokumentasikan backup, restore, dan pengoperasian.

**Selesai jika:** acceptance criteria terpenuhi dan aplikasi berjalan di URL production.

---

## 17. Prompt Implementasi untuk AI Coding Agent

Gunakan prompt berikut setelah menyimpan dokumen ini sebagai `PRD.md` di root repository.

### Prompt Utama

```text
Baca dan pahami seluruh isi PRD.md sebelum mengubah kode.

Kamu bertindak sebagai senior full-stack engineer. Implementasikan DwiSave sesuai PRD menggunakan Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase PostgreSQL, Supabase Auth, dan Vercel.

ATURAN KERJA:
1. Periksa struktur repository dan file yang sudah ada terlebih dahulu.
2. Jangan menimpa pekerjaan yang sudah benar tanpa alasan.
3. Buat rencana implementasi singkat dan daftar file yang akan dibuat/diubah.
4. Implementasikan secara bertahap; jangan membuat seluruh fitur sekaligus tanpa pengujian.
5. Gunakan versi library yang stabil dan pola integrasi Supabase SSR yang sesuai dokumentasi versi terpasang.
6. Gunakan TypeScript strict dan hindari `any` kecuali benar-benar diperlukan serta diberi alasan.
7. Gunakan Zod untuk validasi input di server.
8. Semua halaman privat harus memeriksa session. Semua operasi data harus memeriksa otorisasi dan dilindungi RLS.
9. Jangan pernah mengekspos service role key atau secret key ke browser.
10. Jangan menonaktifkan RLS untuk mengatasi masalah.
11. Gunakan numeric/decimal untuk nominal, bukan floating point.
12. Transfer harus atomik di database dan tidak boleh mengubah saldo gabungan.
13. Jangan menghitung target tabungan secara terpisah jika kontribusinya merepresentasikan perpindahan uang nyata.
14. Jangan memakai data hardcoded untuk dashboard production. Data demo hanya boleh ada dalam seed development yang jelas.
15. Implementasikan loading, empty, error, dan success state.
16. Buat UI responsif dengan tema light, dark, dan system.
17. Buat unit test untuk fungsi keuangan dan pengujian alur utama.
18. Jangan mengklaim suatu fitur selesai jika belum diimplementasikan dan diuji.
19. Jangan menjalankan migration destruktif atau menghapus data tanpa persetujuan.
20. Jangan mencetak secret atau isi file environment ke log.

URUTAN:
A. Audit repository dan buat rencana.
B. Siapkan fondasi aplikasi dan UI.
C. Buat migrations SQL, constraints, indexes, triggers, RLS, dan fungsi database atomik yang diperlukan.
D. Implementasikan Supabase Auth dan proteksi route.
E. Implementasikan akun, kategori, transaksi, dan saldo.
F. Implementasikan dashboard.
G. Implementasikan target dan anggaran.
H. Implementasikan pengingat, laporan, ekspor CSV, dan tema.
I. Jalankan lint, typecheck, unit test, build, dan tes alur penting.
J. Dokumentasikan setup Supabase, environment variables, deployment Vercel, backup, dan keterbatasan yang masih ada.

Pada setiap tahap:
- Jelaskan perubahan secara ringkas.
- Implementasikan kode nyata, bukan hanya contoh atau pseudocode.
- Jalankan pemeriksaan yang tersedia.
- Perbaiki error sebelum melanjutkan.
- Jika memerlukan kredensial atau konfigurasi yang belum tersedia, buat placeholder yang aman dan berikan instruksi setup; jangan mengarang kredensial.
- Jika keputusan bisnis belum jelas, gunakan keputusan dalam PRD dan dokumentasikan asumsi.

Mulai dari audit repository. Setelah itu kerjakan Tahap 1 saja dan laporkan file yang berubah, pemeriksaan yang berhasil, serta langkah berikutnya. Jangan langsung melompat ke semua tahap.
```

### Prompt Lanjutan per Tahap

Setelah setiap tahap berhasil, gunakan prompt berikut:

```text
Lanjutkan ke tahap berikutnya dalam PRD.md.

Sebelum coding:
1. Periksa hasil implementasi tahap sebelumnya.
2. Periksa test dan status build.
3. Identifikasi ketergantungan dan risiko regresi.
4. Implementasikan hanya tahap berikutnya.

Setelah coding:
1. Jalankan lint, typecheck, dan test yang relevan.
2. Perbaiki semua error yang disebabkan perubahan ini.
3. Perbarui README atau dokumentasi jika konfigurasi berubah.
4. Laporkan file yang berubah, hasil pemeriksaan, asumsi, dan pekerjaan yang belum selesai.

Jangan mengklaim deployment, integrasi database, atau notifikasi berhasil jika belum benar-benar dikonfigurasi dan diuji.
```

---

## 18. Definition of Done

MVP dianggap siap digunakan ketika:

- [ ] Aplikasi dapat diakses dari desktop dan mobile.
- [ ] Login, logout, dan proteksi halaman bekerja.
- [ ] RLS telah diuji dan tidak ada akses lintas-pemilik.
- [ ] Pemasukan, pengeluaran, dan transfer bekerja secara konsisten.
- [ ] Transfer dijalankan secara atomik.
- [ ] Dashboard, target, dan anggaran berasal dari data nyata.
- [ ] Tema light, dark, dan system bekerja.
- [ ] Ekspor CSV berfungsi.
- [ ] Pengingat dalam aplikasi berfungsi.
- [ ] Test penting lulus.
- [ ] Build production berhasil.
- [ ] Deployment Vercel terhubung ke Supabase production.
- [ ] Environment variables dan secret aman.
- [ ] Backup dan prosedur pemulihan terdokumentasi.

---

## 19. Keputusan yang Masih Dapat Disesuaikan

- Nama akhir aplikasi.
- Login email/password atau magic link.
- Ambang peringatan anggaran.
- Apakah saldo negatif diperbolehkan.
- Apakah kontribusi target harus selalu terhubung ke transaksi.
- Apakah notifikasi email/push termasuk rilis pertama.
- Apakah data harus dapat diekspor dalam format selain CSV.

**Rekomendasi default:** gunakan nama DwiSave, login email/password, saldo nonnegatif, transfer atomik, kontribusi target terhubung ke transaksi, pengingat dalam aplikasi untuk MVP, dan CSV untuk ekspor.

---

**Akhir PRD — DwiSave v1.0**
