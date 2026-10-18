import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';
import '../../../core/finance/daily_allowance_service.dart';
import '../../../core/formatters/currency_formatter.dart';
import '../../warung/warung_screen.dart';

class DailyAllowanceCard extends StatefulWidget {
  final num todayExpense;
  final num totalBalance;
  final num? monthlyBudget;
  final bool showBalance;
  final VoidCallback onOpenExpenseSheet;
  final VoidCallback onHide;
  final String mode; // 'custom' | 'balance' | 'budget'
  final num customAmount;
  final int paydayDay;
  final Function(String mode, num customAmount, int paydayDay) onSaveSettings;

  const DailyAllowanceCard({
    super.key,
    required this.todayExpense,
    required this.totalBalance,
    this.monthlyBudget,
    required this.showBalance,
    required this.onOpenExpenseSheet,
    required this.onHide,
    required this.mode,
    required this.customAmount,
    required this.paydayDay,
    required this.onSaveSettings,
  });

  @override
  State<DailyAllowanceCard> createState() => _DailyAllowanceCardState();
}

class _DailyAllowanceCardState extends State<DailyAllowanceCard> {
  DailyAllowanceResult get _allowance {
    return DailyAllowanceService.calculate(
      todayExpense: widget.todayExpense,
      totalBalance: widget.totalBalance,
      monthlyBudget: widget.monthlyBudget,
      customDailyAmount: widget.customAmount,
      mode: widget.mode,
      paydayDay: widget.paydayDay,
    );
  }

  void _openSettingsDialog() {
    String tempMode = widget.mode;
    int tempPayday = widget.paydayDay;
    final customController = TextEditingController(
      text: widget.customAmount > 0 ? widget.customAmount.toInt().toString() : '50000',
    );

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
          title: const Row(
            children: [
              Icon(Icons.tune, color: NabangColors.primary, size: 20),
              SizedBox(width: 8),
              Text('Atur Jatah Jajan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'CARA PENENTUAN JATAH',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: NabangColors.textSecondary, letterSpacing: 0.5),
                ),
                const SizedBox(height: 8),

                // Mode 1: Manual / Custom Nominal
                _buildModeOption(
                  title: 'Nominal Tetap Harian (Manual)',
                  subtitle: 'Tentukan sendiri batas rupiah jajan harian Anda (misal: Rp 50.000 / hari)',
                  value: 'custom',
                  groupValue: tempMode,
                  onChanged: (val) => setDialogState(() => tempMode = val!),
                ),
                if (tempMode == 'custom') ...[
                  Padding(
                    padding: const EdgeInsets.only(left: 12, right: 12, bottom: 8),
                    child: TextFormField(
                      controller: customController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'Nominal Jatah per Hari (Rp)',
                        isDense: true,
                        filled: true,
                        fillColor: const Color(0xFFF9FAFB),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],

                // Mode 2: Otomatis dari Saldo
                _buildModeOption(
                  title: 'Otomatis dari Sisa Saldo',
                  subtitle: 'Total saldo dibagi sisa hari sampai tanggal gajian / akhir bulan',
                  value: 'balance',
                  groupValue: tempMode,
                  onChanged: (val) => setDialogState(() => tempMode = val!),
                ),

                // Mode 3: Otomatis dari Anggaran
                _buildModeOption(
                  title: 'Otomatis dari Anggaran Bulanan',
                  subtitle: widget.monthlyBudget != null && widget.monthlyBudget! > 0
                      ? 'Batas anggaran (${CurrencyFormatter.formatRupiah(widget.monthlyBudget!)}) dibagi sisa hari'
                      : 'Belum ada anggaran bulanan yang ditentukan',
                  value: 'budget',
                  groupValue: tempMode,
                  onChanged: (val) => setDialogState(() => tempMode = val!),
                ),
                const SizedBox(height: 10),

                // Tanggal reset gajian (jika mode otomatis)
                if (tempMode != 'custom') ...[
                  const Text(
                    'TANGGAL RESET / GAJIAN',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: NabangColors.textSecondary, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<int>(
                    value: tempPayday,
                    isDense: true,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    items: [
                      const DropdownMenuItem(value: 1, child: Text('Tanggal 1 (Awal Bulan)', style: TextStyle(fontSize: 12))),
                      const DropdownMenuItem(value: 25, child: Text('Tanggal 25 (Gajian Payroll)', style: TextStyle(fontSize: 12))),
                      const DropdownMenuItem(value: 28, child: Text('Tanggal 28 (Akhir Bulan)', style: TextStyle(fontSize: 12))),
                      for (int d = 2; d <= 31; d++)
                        if (![25, 28].contains(d))
                          DropdownMenuItem(value: d, child: Text('Tanggal $d', style: const TextStyle(fontSize: 12))),
                    ],
                    onChanged: (val) => setDialogState(() => tempPayday = val ?? 1),
                  ),
                  const SizedBox(height: 12),
                ],

                const Divider(),
                // Sembunyikan widget button
                InkWell(
                  onTap: () {
                    Navigator.pop(ctx);
                    widget.onHide();
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(vertical: 6.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Sembunyikan Widget ini', style: TextStyle(fontSize: 12, color: NabangColors.danger, fontWeight: FontWeight.w600)),
                        Text('Sembunyikan', style: TextStyle(fontSize: 11, color: NabangColors.danger, decoration: TextDecoration.underline)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: NabangColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                final amt = num.tryParse(customController.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 50000;
                widget.onSaveSettings(tempMode, amt, tempPayday);
                Navigator.pop(ctx);
              },
              child: const Text('Simpan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModeOption({
    required String title,
    required String subtitle,
    required String value,
    required String groupValue,
    required ValueChanged<String?> onChanged,
  }) {
    final isSelected = value == groupValue;
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFFFFF1F2) : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: isSelected ? const Color(0xFFFDA4AF) : Colors.transparent),
      ),
      child: RadioListTile<String>(
        value: value,
        groupValue: groupValue,
        onChanged: onChanged,
        activeColor: NabangColors.primary,
        dense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 6),
        title: Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 10.5, color: NabangColors.textSecondary)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final allowance = _allowance;

    Color statusColor;
    Color statusBgColor;
    String statusText;
    IconData statusIcon;

    if (allowance.isOver) {
      statusColor = const Color(0xFFBE123C);
      statusBgColor = const Color(0xFFFFE4E6);
      statusText = 'Melebihi Jatah Harian';
      statusIcon = Icons.warning_amber_rounded;
    } else if (allowance.isWarning) {
      statusColor = const Color(0xFFB45309);
      statusBgColor = const Color(0xFFFEF3C7);
      statusText = 'Mulai Menipis';
      statusIcon = Icons.access_time_rounded;
    } else {
      statusColor = const Color(0xFF047857);
      statusBgColor = const Color(0xFFD1FAE5);
      statusText = 'Aman Digunakan';
      statusIcon = Icons.verified_user_rounded;
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF5F5), Colors.white, Color(0xFFFFF5F7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFFECDD3), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFBE123C).withOpacity(0.06),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Shield Icon, Title, Safe-to-Spend badge, Action buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: statusBgColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(statusIcon, color: statusColor, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text(
                            'Jatah Jajan Hari Ini',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: NabangColors.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFE4E6),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'SAFE-TO-SPEND',
                              style: TextStyle(
                                fontSize: 8.5,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF9F1239),
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        widget.mode == 'custom'
                            ? 'Target: ${CurrencyFormatter.formatRupiah(widget.customAmount)} / hari'
                            : 'Hitungan aman pengeluaran harian Anda',
                        style: const TextStyle(fontSize: 10.5, color: NabangColors.textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
              Row(
                children: [
                  InkWell(
                    onTap: _openSettingsDialog,
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: NabangColors.border),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.tune, size: 12, color: NabangColors.textSecondary),
                          SizedBox(width: 4),
                          Text('Atur', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: NabangColors.textSecondary)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  InkWell(
                    onTap: widget.onHide,
                    borderRadius: BorderRadius.circular(8),
                    child: const Padding(
                      padding: EdgeInsets.all(4.0),
                      child: Icon(Icons.close, size: 16, color: NabangColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Main nominal box
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFF3F4F6)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Sisa Jatah Jajan Hari Ini',
                          style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: NabangColors.textSecondary),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          widget.showBalance
                              ? CurrencyFormatter.formatRupiah(allowance.remainingToday)
                              : 'Rp ••••••••••',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                            color: statusColor,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusBgColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(statusIcon, size: 12, color: statusColor),
                          const SizedBox(width: 4),
                          Text(
                            statusText,
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Progress bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Terpakai Hari Ini: ${widget.showBalance ? CurrencyFormatter.formatRupiah(allowance.todayExpense) : "••••"}',
                      style: const TextStyle(fontSize: 10.5, color: NabangColors.textSecondary),
                    ),
                    Text(
                      '${allowance.percentageUsed}%',
                      style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: NabangColors.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: allowance.percentageUsed / 100,
                    minHeight: 6,
                    backgroundColor: const Color(0xFFF3F4F6),
                    valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  allowance.message,
                  style: const TextStyle(fontSize: 10.5, color: NabangColors.textSecondary, height: 1.3),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // 3 Sub-metrik
          Row(
            children: [
              Expanded(
                child: _buildSubMetric(
                  label: 'Jatah Dasar',
                  value: widget.showBalance ? CurrencyFormatter.formatRupiah(allowance.dailyAllowance) : '••••',
                  icon: Icons.monetization_on_outlined,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _buildSubMetric(
                  label: 'Belanja Hari Ini',
                  value: widget.showBalance ? CurrencyFormatter.formatRupiah(allowance.todayExpense) : '••••',
                  icon: Icons.shopping_bag_outlined,
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _buildSubMetric(
                  label: 'Sisa Hari',
                  value: '${allowance.daysRemaining} hari',
                  icon: Icons.calendar_month_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Tombol Aksi Cepat
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: widget.onOpenExpenseSheet,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFB34455),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    elevation: 0,
                  ),
                  icon: const Icon(Icons.add, size: 14),
                  label: const Text('Catat Pengeluaran', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const WarungScreen()),
                  );
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF8F3242),
                  backgroundColor: const Color(0xFFFFF1F2),
                  side: const BorderSide(color: Color(0xFFFECDD3)),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.restaurant, size: 14),
                label: const Text('Warung', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSubMetric({
    required String label,
    required String value,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: NabangColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 12, color: NabangColors.textSecondary),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 9.5, color: NabangColors.textSecondary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: NabangColors.textPrimary),
          ),
        ],
      ),
    );
  }
}
