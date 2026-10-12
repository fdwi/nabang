-- ============================================================================
-- DwiSave Seed Data Otomatis
-- Mengisi kategori dan akun bawaan untuk user pemilik yang baru dibuat
-- ============================================================================

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Mengambil user ID terbaru dari auth.users secara otomatis
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Belum ada user di auth.users. Silakan buat user terlebih dahulu di menu Authentication > Users.';
  END IF;

  -- Kategori Pemasukan
  INSERT INTO public.categories (user_id, name, type, color, icon)
  VALUES
    (v_user_id, 'Gaji', 'income', '#2d7a4d', 'banknote'),
    (v_user_id, 'Bonus & THR', 'income', '#1d6f42', 'gift'),
    (v_user_id, 'Investasi', 'income', '#2563eb', 'trending-up'),
    (v_user_id, 'Lain-lain', 'income', '#6b7280', 'circle')
  ON CONFLICT DO NOTHING;

  -- Kategori Pengeluaran
  INSERT INTO public.categories (user_id, name, type, color, icon)
  VALUES
    (v_user_id, 'Makanan & Minuman', 'expense', '#e11d48', 'utensils'),
    (v_user_id, 'Transportasi', 'expense', '#ea580c', 'car'),
    (v_user_id, 'Tempat Tinggal', 'expense', '#d97706', 'home'),
    (v_user_id, 'Tagihan & Utilitas', 'expense', '#ca8a04', 'receipt'),
    (v_user_id, 'Belanja Kebutuhan', 'expense', '#059669', 'shopping-bag'),
    (v_user_id, 'Kesehatan', 'expense', '#dc2626', 'heart-pulse'),
    (v_user_id, 'Hiburan', 'expense', '#7c3aed', 'gamepad-2'),
    (v_user_id, 'Lain-lain', 'expense', '#6b7280', 'more-horizontal')
  ON CONFLICT DO NOTHING;

  -- Akun Default
  INSERT INTO public.accounts (user_id, name, account_type, opening_balance, is_active)
  VALUES
    (v_user_id, 'Dompet Tunai', 'cash', 0, true),
    (v_user_id, 'Rekening Utama', 'bank', 0, true)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed data berhasil diisi untuk user ID: %', v_user_id;
END $$;
