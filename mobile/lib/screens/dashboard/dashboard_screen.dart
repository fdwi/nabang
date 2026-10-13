import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/formatters/currency_formatter.dart';
import '../../models/account_model.dart';
import '../../models/category_model.dart';
import '../../models/transaction_model.dart';
import '../../services/supabase_service.dart';
import '../transactions/add_transaction_sheet.dart';

class DashboardScreen extends StatefulWidget {
  final Function(int) onNavigateTab;
  final VoidCallback? onLogout;

  const DashboardScreen({
    super.key,
    required this.onNavigateTab,
    this.onLogout,
  });

  @override
  State<DashboardScreen> createState() => DashboardScreenState();
}

class DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;
  bool _showBalance = true;
  String _selectedPeriod = 'this_month'; // this_month, last_3_months, this_year, all
  String _displayName = 'Pemilik';

  List<AccountModel> _accounts = [];
  List<CategoryModel> _categories = [];
  List<TransactionModel> _transactions = [];

  num _totalBalance = 0;

  void reload() => _loadData();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }

  Future<void> _loadData() async {
    try {
      final accountsFuture = SupabaseService.instance.getAccounts();
      final categoriesFuture = SupabaseService.instance.getCategories();
      final transactionsFuture = SupabaseService.instance.getTransactions(limit: 50);
      final profileNameFuture = SupabaseService.instance.getDisplayName();

      final accounts = await accountsFuture;
      final categories = await categoriesFuture;
      final transactions = await transactionsFuture;
      final profileName = await profileNameFuture;

      num totalBal = 0;
      for (final a in accounts) {
        if (a.isActive) totalBal += a.currentBalance;
      }

      final userEmail = SupabaseService.instance.currentUser?.email;
      String computedName = 'Pemilik';
      if (profileName != null && profileName.trim().isNotEmpty) {
        computedName = profileName.trim();
      } else if (userEmail != null && userEmail.contains('@')) {
        computedName = userEmail.split('@')[0];
      }

      if (mounted) {
        setState(() {
          _accounts = accounts;
          _categories = categories;
          _transactions = transactions;
          _totalBalance = totalBal;
          _displayName = computedName;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<TransactionModel> get _filteredTransactions {
    final now = DateTime.now();
    return _transactions.where((tx) {
      if (_selectedPeriod == 'this_month') {
        return tx.occurredAt.year == now.year && tx.occurredAt.month == now.month;
      } else if (_selectedPeriod == 'last_3_months') {
        final threeMonthsAgo = DateTime(now.year, now.month - 3, now.day);
        return tx.occurredAt.isAfter(threeMonthsAgo);
      } else if (_selectedPeriod == 'this_year') {
        return tx.occurredAt.year == now.year;
      }
      return true;
    }).toList();
  }

  num get _periodIncome {
    num total = 0;
    for (final tx in _filteredTransactions) {
      if (tx.type == 'income') total += tx.amount;
    }
    return total;
  }

  num get _periodExpense {
    num total = 0;
    for (final tx in _filteredTransactions) {
      if (tx.type == 'expense') total += tx.amount;
    }
    return total;
  }

  num get _cashFlow => _periodIncome - _periodExpense;

  void _openAddTransactionSheet([String defaultType = 'expense']) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AddTransactionSheet(
        accounts: _accounts,
        categories: _categories,
        onSaved: _loadData,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: NabangColors.background,
        body: Center(
          child: CircularProgressIndicator(color: NabangColors.primary),
        ),
      );
    }

    final displayName = _displayName;

    return Scaffold(
      backgroundColor: NabangColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: NabangColors.primary,
          onRefresh: _loadData,
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 1. Header Sapaan Pengguna ala Livin'
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${_getGreeting()},',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFFB34455),
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            displayName,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: NabangColors.textPrimary,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Pantau dan kelola keuangan harian Anda dengan mudah.',
                            style: TextStyle(
                              fontSize: 12,
                              color: NabangColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.refresh, color: NabangColors.textSecondary, size: 22),
                          constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                          onPressed: _loadData,
                        ),
                        IconButton(
                          icon: const Icon(Icons.settings_outlined, color: NabangColors.textSecondary, size: 22),
                          constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                          onPressed: () => widget.onNavigateTab(5),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // 2. Kartu Virtual Platinum Pink ala Livin' Mandiri
                RepaintBoundary(
                  child: Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF7A0C2E), Color(0xFFBE123C), Color(0xFFFB7185)],
                      begin: Alignment.bottomLeft,
                      end: Alignment.topRight,
                    ),
                    borderRadius: BorderRadius.circular(26),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFBE123C).withOpacity(0.35),
                        blurRadius: 18,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Baris Atas Kartu: Logo Brand & Chip Pintar EMV Emas
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.credit_card, color: Colors.white, size: 20),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'NABANG',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 1.2,
                                    ),
                                  ),
                                  Text(
                                    'Virtual Platinum',
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.85),
                                      fontSize: 10,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              const Icon(Icons.wifi, color: Colors.white70, size: 20),
                              const SizedBox(width: 8),
                              // Chip Emas EMV
                              Container(
                                width: 34,
                                height: 24,
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFFFBBF24), Color(0xFFFDE68A)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(5),
                                  border: Border.all(color: Colors.amber.shade200, width: 0.8),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Baris Tengah: Label Saldo & Floating Pill Saldo ala Kendrick Lamar demo
                      Text(
                        'Total Saldo Rekening',
                        style: TextStyle(
                          color: Colors.pink.shade100,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.55),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: Colors.white.withOpacity(0.25), width: 1),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.3),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _showBalance ? CurrencyFormatter.formatRupiah(_totalBalance) : 'Rp ••••••••••',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              const SizedBox(width: 8),
                              InkWell(
                                onTap: () => setState(() => _showBalance = !_showBalance),
                                borderRadius: BorderRadius.circular(20),
                                child: Padding(
                                  padding: const EdgeInsets.all(4.0),
                                  child: Icon(
                                    _showBalance ? Icons.visibility : Icons.visibility_off,
                                    color: Colors.white70,
                                    size: 18,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Baris Bawah: Nomor Kartu & Nama Pemilik
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '5241 •••• •••• 8829',
                                style: TextStyle(
                                  fontFamily: 'monospace',
                                  color: Colors.white.withOpacity(0.9),
                                  fontSize: 12,
                                  letterSpacing: 2,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                displayName.toUpperCase(),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                'VALID THRU',
                                style: TextStyle(
                                  color: Colors.pink.shade100,
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const Text(
                                '10/29',
                                style: TextStyle(
                                  fontFamily: 'monospace',
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // 3. Banner Ilustrasi Keuangan 3D (Gaya Livin' Lifestyle Promo)
              RepaintBoundary(
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFFF1F2), Colors.white, Color(0xFFFFF1F2)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: const Color(0xFFFECDD3)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Wujudkan Target Finansial Anda',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: NabangColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Kelola setoran rutin ke target tabungan dan pantau batas anggaran bulanan.',
                              style: TextStyle(
                                fontSize: 11,
                                color: NabangColors.textSecondary,
                                height: 1.4,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                ElevatedButton.icon(
                                  onPressed: () => widget.onNavigateTab(3),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFB34455),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    minimumSize: const Size(0, 36),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    elevation: 0,
                                  ),
                                  icon: const Icon(Icons.flag_outlined, size: 14),
                                  label: const Text('Target Impian', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                                OutlinedButton.icon(
                                  onPressed: () => widget.onNavigateTab(4),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: NabangColors.textPrimary,
                                    backgroundColor: Colors.white,
                                    side: const BorderSide(color: NabangColors.border),
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    minimumSize: const Size(0, 36),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  icon: const Icon(Icons.pie_chart_outline, size: 14),
                                  label: const Text('Anggaran', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.asset(
                          'assets/images/livin-pink-hero.jpg',
                          width: 80,
                          height: 80,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const SizedBox(),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

                // 4. Menu Aksi Cepat Ikon Bulat (Grid 6 Menu ala Livin' Mandiri)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: NabangColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Aksi Cepat & Menu Keuangan',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: NabangColors.textPrimary,
                            ),
                          ),
                          Text(
                            'Pintasan Layanan',
                            style: TextStyle(fontSize: 11, color: NabangColors.textSecondary),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildQuickActionButton(
                            icon: Icons.swap_horiz,
                            label: 'Transfer',
                            bgColor: const Color(0xFFDBEAFE),
                            iconColor: const Color(0xFF1D4ED8),
                            onTap: () => _openAddTransactionSheet('transfer'),
                          ),
                          _buildQuickActionButton(
                            icon: Icons.arrow_downward,
                            label: 'Pemasukan',
                            bgColor: const Color(0xFFD1FAE5),
                            iconColor: const Color(0xFF047857),
                            onTap: () => _openAddTransactionSheet('income'),
                          ),
                          _buildQuickActionButton(
                            icon: Icons.arrow_upward,
                            label: 'Pengeluaran',
                            bgColor: const Color(0xFFFFE4E6),
                            iconColor: const Color(0xFFBE123C),
                            onTap: () => _openAddTransactionSheet('expense'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildQuickActionButton(
                            icon: Icons.flag_outlined,
                            label: 'Target',
                            bgColor: const Color(0xFFFCE7F3),
                            iconColor: const Color(0xFFBE185D),
                            onTap: () => widget.onNavigateTab(3),
                          ),
                          _buildQuickActionButton(
                            icon: Icons.pie_chart_outline,
                            label: 'Anggaran',
                            bgColor: const Color(0xFFFEF3C7),
                            iconColor: const Color(0xFFB45309),
                            onTap: () => widget.onNavigateTab(4),
                          ),
                          _buildQuickActionButton(
                            icon: Icons.account_balance_wallet_outlined,
                            label: 'Rekening',
                            bgColor: const Color(0xFFF3E8FF),
                            iconColor: const Color(0xFF6B21A8),
                            onTap: () => widget.onNavigateTab(2),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // 5. Baris Filter Periode
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildPeriodChip('this_month', 'Bulan Ini'),
                          const SizedBox(width: 6),
                          _buildPeriodChip('last_3_months', '3 Bulan'),
                          const SizedBox(width: 6),
                          _buildPeriodChip('this_year', 'Tahun Ini'),
                          const SizedBox(width: 6),
                          _buildPeriodChip('all', 'Semua'),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // 6. Kartu Metrik Ringkasan Saldo & Arus Kas (Sama persis seperti StatCard web)
                Row(
                  children: [
                    Expanded(
                      child: _buildMetricCard(
                        title: 'Pemasukan',
                        value: _periodIncome,
                        icon: Icons.arrow_downward,
                        iconColor: NabangColors.success,
                        bgColor: NabangColors.success.withOpacity(0.1),
                        trend: '+ Masuk',
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildMetricCard(
                        title: 'Pengeluaran',
                        value: _periodExpense,
                        icon: Icons.arrow_upward,
                        iconColor: NabangColors.danger,
                        bgColor: NabangColors.danger.withOpacity(0.1),
                        trend: '- Keluar',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                _buildMetricCard(
                  title: 'Arus Kas Bersih (Cash Flow)',
                  value: _cashFlow,
                  icon: Icons.balance,
                  iconColor: _cashFlow >= 0 ? const Color(0xFF047857) : NabangColors.danger,
                  bgColor: (_cashFlow >= 0 ? const Color(0xFF047857) : NabangColors.danger).withOpacity(0.1),
                  trend: _cashFlow >= 0 ? 'Surplus Finansial' : 'Defisit Pengeluaran',
                  isFullWidth: true,
                ),
                const SizedBox(height: 22),

                // 7. Rekening & Dompet
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Rekening & Dompet Aktif',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: NabangColors.textPrimary,
                      ),
                    ),
                    TextButton(
                      onPressed: () => widget.onNavigateTab(2),
                      style: TextButton.styleFrom(
                        minimumSize: const Size(44, 44),
                        foregroundColor: const Color(0xFFB34455),
                      ),
                      child: const Text('Kelola', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ],
                ),
                const SizedBox(height: 6),

                if (_accounts.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: NabangColors.border),
                    ),
                    child: const Center(
                      child: Text('Belum ada rekening aktif.', style: TextStyle(color: NabangColors.textSecondary, fontSize: 13)),
                    ),
                  )
                else
                  SizedBox(
                    height: 100,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _accounts.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (context, index) {
                        final acc = _accounts[index];
                        return Container(
                          width: 150,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: NabangColors.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                acc.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    acc.accountType.toUpperCase(),
                                    style: const TextStyle(fontSize: 9, color: NabangColors.textSecondary, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    CurrencyFormatter.formatRupiah(acc.currentBalance),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 13,
                                      color: NabangColors.primaryDark,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                const SizedBox(height: 22),

                // 8. Transaksi Terakhir
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Transaksi Terakhir',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: NabangColors.textPrimary,
                      ),
                    ),
                    TextButton(
                      onPressed: () => widget.onNavigateTab(1),
                      style: TextButton.styleFrom(
                        minimumSize: const Size(44, 44),
                        foregroundColor: const Color(0xFFB34455),
                      ),
                      child: const Text('Semua', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ],
                ),
                const SizedBox(height: 6),

                if (_transactions.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: NabangColors.border),
                    ),
                    child: const Center(
                      child: Text('Belum ada transaksi.', style: TextStyle(color: NabangColors.textSecondary, fontSize: 13)),
                    ),
                  )
                else
                  Column(
                    children: [
                      for (final tx in _transactions.take(5))
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: NabangColors.border),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: BoxDecoration(
                                    color: tx.type == 'transfer'
                                        ? Colors.blue.withOpacity(0.1)
                                        : tx.type == 'income'
                                            ? NabangColors.success.withOpacity(0.1)
                                            : NabangColors.danger.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Icon(
                                    tx.type == 'transfer'
                                        ? Icons.swap_horiz
                                        : tx.type == 'income'
                                            ? Icons.arrow_downward
                                            : Icons.arrow_upward,
                                    size: 18,
                                    color: tx.type == 'transfer'
                                        ? Colors.blue
                                        : tx.type == 'income'
                                            ? NabangColors.success
                                            : NabangColors.danger,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        tx.description?.isNotEmpty == true
                                            ? tx.description!
                                            : (tx.categoryName ?? (tx.type == 'transfer' ? 'Transfer Antar Akun' : 'Transaksi')),
                                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        CurrencyFormatter.formatDate(tx.occurredAt),
                                        style: const TextStyle(fontSize: 11, color: NabangColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  '${tx.type == 'income' ? '+' : tx.type == 'transfer' ? '' : '-'}${CurrencyFormatter.formatRupiah(tx.amount)}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                    color: tx.type == 'income'
                                        ? NabangColors.success
                                        : tx.type == 'transfer'
                                            ? Colors.blue
                                            : NabangColors.danger,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionButton({
    required IconData icon,
    required String label,
    required Color bgColor,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        constraints: const BoxConstraints(minWidth: 75),
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Column(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: iconColor, size: 24),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: NabangColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPeriodChip(String id, String label) {
    final isSelected = _selectedPeriod == id;
    return GestureDetector(
      onTap: () => setState(() => _selectedPeriod = id),
      child: Container(
        constraints: const BoxConstraints(minHeight: 36),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFB34455) : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? const Color(0xFFB34455) : NabangColors.border),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : NabangColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required num value,
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String trend,
    bool isFullWidth = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: NabangColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 11, color: NabangColors.textSecondary, fontWeight: FontWeight.w500)),
              Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(8)),
                child: Icon(icon, size: 14, color: iconColor),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            CurrencyFormatter.formatRupiah(value),
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: NabangColors.textPrimary),
          ),
          const SizedBox(height: 4),
          Text(trend, style: TextStyle(fontSize: 10, color: iconColor, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
