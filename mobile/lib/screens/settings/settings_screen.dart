import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../services/supabase_service.dart';
import '../auth/login_screen.dart';

class SettingsScreen extends StatefulWidget {
  final VoidCallback? onProfileUpdated;

  const SettingsScreen({super.key, this.onProfileUpdated});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _nameController = TextEditingController();
  bool _isLoading = true;
  bool _isSaving = false;
  String? _statusMessage;
  bool _isSuccess = false;
  String _userEmail = '';

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    final user = SupabaseService.instance.currentUser;
    _userEmail = user?.email ?? 'Belum terautentikasi';

    try {
      final name = await SupabaseService.instance.getDisplayName();
      if (name != null && name.isNotEmpty) {
        _nameController.text = name;
      } else {
        _nameController.text = _userEmail.split('@')[0];
      }
    } catch (_) {
      _nameController.text = _userEmail.split('@')[0];
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveDisplayName() async {
    final newName = _nameController.text.trim();
    if (newName.isEmpty) {
      setState(() {
        _statusMessage = 'Nama tidak boleh kosong';
        _isSuccess = false;
      });
      return;
    }

    setState(() {
      _isSaving = true;
      _statusMessage = null;
    });

    try {
      await SupabaseService.instance.updateDisplayName(newName);
      setState(() {
        _statusMessage = 'Nama profil berhasil diperbarui.';
        _isSuccess = true;
      });
      widget.onProfileUpdated?.call();
    } catch (e) {
      setState(() {
        _statusMessage = 'Gagal menyimpan: $e';
        _isSuccess = false;
      });
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Keluar dari Akun?'),
        content: const Text('Apakah Anda yakin ingin keluar dari aplikasi Nabang?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: NabangColors.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Keluar', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await SupabaseService.instance.signOut();
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NabangColors.background,
      appBar: AppBar(
        title: const Text(
          'Pengaturan',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: NabangColors.textPrimary,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: NabangColors.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 1. Profil Pemilik Akun
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: NabangColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 42,
                              height: 42,
                              decoration: BoxDecoration(
                                color: const Color(0xFFFCE7F3),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.person, color: Color(0xFFBE123C), size: 22),
                            ),
                            const SizedBox(width: 12),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Profil Pemilik Akun',
                                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    'Informasi akun yang digunakan di Nabang',
                                    style: TextStyle(fontSize: 12, color: NabangColors.textSecondary),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 18),

                        // Alamat Email
                        const Text(
                          'Alamat Email',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: NabangColors.textSecondary),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: NabangColors.border),
                          ),
                          child: Text(
                            _userEmail,
                            style: const TextStyle(fontSize: 14, color: NabangColors.textSecondary),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Nama Tampilan
                        const Text(
                          'Nama Tampilan',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: NabangColors.textSecondary),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _nameController,
                          decoration: InputDecoration(
                            hintText: 'Contoh: Dwi',
                            filled: true,
                            fillColor: Colors.white,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                        const SizedBox(height: 14),

                        if (_statusMessage != null) ...[
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: _isSuccess
                                  ? NabangColors.success.withOpacity(0.1)
                                  : NabangColors.danger.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  _isSuccess ? Icons.check_circle_outline : Icons.error_outline,
                                  color: _isSuccess ? NabangColors.success : NabangColors.danger,
                                  size: 18,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _statusMessage!,
                                    style: TextStyle(
                                      color: _isSuccess ? NabangColors.success : NabangColors.danger,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],

                        SizedBox(
                          height: 44,
                          child: ElevatedButton(
                            onPressed: _isSaving ? null : _saveDisplayName,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFB34455),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              elevation: 0,
                            ),
                            child: _isSaving
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                  )
                                : const Text('Simpan Perubahan', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

                  // 2. Preferensi Regional dan Tema
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: NabangColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Preferensi Regional dan Tema',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Konfigurasi tampilan dan format penanggalan aplikasi',
                          style: TextStyle(fontSize: 12, color: NabangColors.textSecondary),
                        ),
                        const SizedBox(height: 16),

                        // Mata Uang
                        _buildPreferenceRow(
                          icon: Icons.payments_outlined,
                          title: 'Mata Uang',
                          value: 'IDR (Rupiah Indonesia)',
                        ),
                        const Divider(height: 20, color: NabangColors.border),

                        // Zona Waktu
                        _buildPreferenceRow(
                          icon: Icons.access_time_outlined,
                          title: 'Zona Waktu',
                          value: 'Asia/Jakarta (WIB)',
                        ),
                        const Divider(height: 20, color: NabangColors.border),

                        // Tema Aplikasi
                        _buildPreferenceRow(
                          icon: Icons.palette_outlined,
                          title: 'Tema Tampilan',
                          value: 'Livin Pink Edition (Light)',
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

                  // 3. Keamanan & Sesi Akun
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: NabangColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Keamanan & Sesi Akun',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Data transaksi terlindungi dengan enkripsi row-level Supabase RLS.',
                          style: TextStyle(fontSize: 12, color: NabangColors.textSecondary),
                        ),
                        const SizedBox(height: 16),

                        Row(
                          children: [
                            const Icon(Icons.shield_outlined, color: NabangColors.success, size: 20),
                            const SizedBox(width: 10),
                            const Expanded(
                              child: Text(
                                'Status Enkripsi RLS',
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: NabangColors.success.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'Aktif & Aman',
                                style: TextStyle(
                                  color: NabangColors.success,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Tombol Keluar
                        SizedBox(
                          height: 44,
                          child: OutlinedButton.icon(
                            onPressed: _handleLogout,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: NabangColors.danger,
                              side: BorderSide(color: NabangColors.danger.withOpacity(0.5)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: const Icon(Icons.logout, size: 18),
                            label: const Text('Keluar dari Akun', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Footer Version
                  const Center(
                    child: Text(
                      'Nabang Mobile v1.0.0 • Livin Pink Edition',
                      style: TextStyle(fontSize: 11, color: NabangColors.textSecondary),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
    );
  }

  Widget _buildPreferenceRow({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, size: 20, color: NabangColors.textSecondary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 12, color: NabangColors.textSecondary)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }
}
