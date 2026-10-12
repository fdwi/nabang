import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/constants/supabase_config.dart';
import 'core/theme/app_theme.dart';
import 'screens/auth/login_screen.dart';
import 'screens/main_nav_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inisialisasi locale data Bahasa Indonesia untuk format tanggal
  await initializeDateFormatting('id_ID', null);

  // Set status bar transparent with dark icons
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Inisialisasi Supabase Backend
  await Supabase.initialize(
    url: SupabaseConfig.supabaseUrl,
    // ignore: deprecated_member_use
    anonKey: SupabaseConfig.supabaseAnonKey,
  );

  runApp(const NabangApp());
}

class NabangApp extends StatelessWidget {
  const NabangApp({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isLoggedIn = Supabase.instance.client.auth.currentUser != null;

    return MaterialApp(
      title: 'Nabang',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: isLoggedIn ? const MainNavScreen() : const LoginScreen(),
    );
  }
}
