import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../services/supabase_service.dart';
import 'auth/login_screen.dart';
import 'dashboard/dashboard_screen.dart';
import 'transactions/transactions_screen.dart';
import 'accounts/accounts_screen.dart';
import 'goals/goals_screen.dart';
import 'budgets/budgets_screen.dart';
import 'settings/settings_screen.dart';

class MainNavScreen extends StatefulWidget {
  const MainNavScreen({super.key});

  @override
  State<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends State<MainNavScreen> {
  int _currentIndex = 0;
  final GlobalKey<DashboardScreenState> _dashboardKey = GlobalKey<DashboardScreenState>();

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
    if (index == 0) {
      _dashboardKey.currentState?.reload();
    }
  }

  Future<void> _logout() async {
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
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      DashboardScreen(
        key: _dashboardKey,
        onNavigateTab: _onTabTapped,
        onLogout: _logout,
      ),
      const TransactionsScreen(),
      const AccountsScreen(),
      const GoalsScreen(),
      const BudgetsScreen(),
      SettingsScreen(
        onProfileUpdated: () {
          _dashboardKey.currentState?.reload();
        },
      ),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: NabangColors.border, width: 1)),
        ),
        child: NavigationBarTheme(
          data: NavigationBarThemeData(
            height: 62,
            indicatorColor: NabangColors.primary.withOpacity(0.12),
            indicatorShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            labelTextStyle: WidgetStateProperty.resolveWith((states) {
              final isSelected = states.contains(WidgetState.selected);
              return TextStyle(
                fontSize: 10.5,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? NabangColors.primary : NabangColors.textSecondary,
              );
            }),
            iconTheme: WidgetStateProperty.resolveWith((states) {
              final isSelected = states.contains(WidgetState.selected);
              return IconThemeData(
                size: 22,
                color: isSelected ? NabangColors.primary : NabangColors.textSecondary,
              );
            }),
          ),
          child: NavigationBar(
            selectedIndex: _currentIndex,
            onDestinationSelected: _onTabTapped,
            backgroundColor: Colors.white,
            elevation: 0,
            labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home),
                label: 'Beranda',
              ),
              NavigationDestination(
                icon: Icon(Icons.receipt_long_outlined),
                selectedIcon: Icon(Icons.receipt_long),
                label: 'Transaksi',
              ),
              NavigationDestination(
                icon: Icon(Icons.account_balance_wallet_outlined),
                selectedIcon: Icon(Icons.account_balance_wallet),
                label: 'Akun',
              ),
              NavigationDestination(
                icon: Icon(Icons.flag_outlined),
                selectedIcon: Icon(Icons.flag),
                label: 'Impian',
              ),
              NavigationDestination(
                icon: Icon(Icons.pie_chart_outline),
                selectedIcon: Icon(Icons.pie_chart),
                label: 'Anggaran',
              ),
              NavigationDestination(
                icon: Icon(Icons.settings_outlined),
                selectedIcon: Icon(Icons.settings),
                label: 'Pengaturan',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
