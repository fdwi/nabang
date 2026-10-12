# Nabang Mobile (Flutter)

Aplikasi mobile resmi **Nabang** untuk pengelolaan keuangan dan tabungan pribadi, terhubung langsung dengan backend Supabase yang sama dengan versi web.

## Fitur Utama

1. **Dashboard Livin' Pink Edition**:
   - Kartu saldo utama dengan gradien Rose (*Nabang Virtual Card*).
   - Ringkasan pemasukan, pengeluaran, dan arus kas berjalan.
   - Tombol aksi cepat: Catat Transaksi, Nabung Impian, dan Cek Anggaran.
   - Daftar rekening dan riwayat 5 transaksi terkini.
2. **Riwayat Transaksi**:
   - Filter transaksi: Semua, Pengeluaran, Pemasukan, Transfer antar rekening.
   - Dukungan hapus transaksi langsung dengan konfirmasi modal.
3. **Pencatatan Transaksi Baru**:
   - Form pencatatan cepat dengan pilihan tipe (Pengeluaran, Pemasukan, Transfer).
   - Dropdown akun sumber dan tujuan (khusus transfer).
   - Dropdown kategori pengeluaran/pemasukan.
4. **Rekening & Dompet (Accounts)**:
   - Manajemen rekening bank, e-wallet, dan kas tunai.
   - Perhitungan saldo berjalan otomatis secara realtime dari seluruh mutasi transaksi.
5. **Target Impian (Savings Goals)**:
   - Target tabungan dengan batas waktu (deadline).
   - Progress bar persentase pencapaian.
   - Modal setoran langsung ("Nabung") ke dalam target impian.
6. **Anggaran Bulanan (Budgets)**:
   - Pengaturan pagu anggaran per kategori pengeluaran per bulan.
   - Indikator peringatan otomatis jika pengeluaran melebihi batas anggaran.
7. **Autentikasi & Keamanan**:
   - Login dan pendaftaran akun menggunakan Supabase Auth.
   - Tampilan login minimalis berlogo resmi Nabang tanpa latar belakang berlebihan.

---

## Struktur Folder

```
mobile/
├── assets/
│   └── images/
│       ├── logonabang.png         # Logo resmi Nabang
│       └── livin-pink-hero.jpg
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   │   ├── colors.dart        # NabangColors (Palet Rose & Pink Edition)
│   │   │   └── supabase_config.dart # Konfigurasi URL & Anon Key Supabase
│   │   ├── formatters/
│   │   │   └── currency_formatter.dart # Formatter Rupiah & Tanggal ID
│   │   └── theme/
│   │       └── app_theme.dart     # Material 3 & Google Fonts Plus Jakarta Sans
│   ├── models/
│   │   ├── account_model.dart
│   │   ├── budget_model.dart
│   │   ├── category_model.dart
│   │   ├── goal_model.dart
│   │   └── transaction_model.dart
│   ├── screens/
│   │   ├── accounts/
│   │   │   ├── accounts_screen.dart
│   │   │   └── add_account_sheet.dart
│   │   ├── auth/
│   │   │   └── login_screen.dart
│   │   ├── budgets/
│   │   │   ├── add_budget_sheet.dart
│   │   │   └── budgets_screen.dart
│   │   ├── dashboard/
│   │   │   └── dashboard_screen.dart
│   │   ├── goals/
│   │   │   ├── add_goal_sheet.dart
│   │   │   └── goals_screen.dart
│   │   ├── transactions/
│   │   │   ├── add_transaction_sheet.dart
│   │   │   └── transactions_screen.dart
│   │   └── main_nav_screen.dart
│   ├── services/
│   │   └── supabase_service.dart  # Integrasi CRUD Supabase
│   └── main.dart                  # Entry Point
└── pubspec.yaml
```

---

## Cara Menjalankan Aplikasi di HP / Emulator

### 1. Prasyarat
- Pasang [Flutter SDK](https://flutter.dev/docs/get-started/install) (versi 3.0.0 ke atas).
- Pasang ekstensi Flutter & Dart di VS Code atau Android Studio.
- Emulator Android / iOS Simulator atau sambungkan HP Android menggunakan kabel data (aktifkan USB Debugging).

### 2. Instalasi Dependensi
Buka terminal di folder `mobile`:
```bash
cd mobile
flutter pub get
```

### 3. Menjalankan Mode Debug
Pastikan perangkat atau emulator terdeteksi dengan menjalankan:
```bash
flutter devices
```
Lalu jalankan aplikasi:
```bash
flutter run
```

### 4. Membangun Berkas APK untuk Android
Untuk membuat file installer `.apk` yang bisa langsung dipasang di HP Android:
```bash
flutter build apk --release
```
Berkas APK akan tersedia di folder:
`mobile/build/app/outputs/flutter-apk/app-release.apk`
