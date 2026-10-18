import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/constants/colors.dart';
import '../../core/formatters/currency_formatter.dart';
import '../../models/account_model.dart';
import '../../models/warung_model.dart';
import '../../services/supabase_service.dart';
import 'add_warung_order_sheet.dart';

class WarungScreen extends StatefulWidget {
  const WarungScreen({super.key});

  @override
  State<WarungScreen> createState() => _WarungScreenState();
}

class _WarungScreenState extends State<WarungScreen> {
  bool _isLoading = true;
  List<WarungOrderModel> _orders = [];
  List<AccountModel> _accounts = [];
  String _filter = 'all'; // 'all' | 'kasbon' | 'lunas'

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final ordersFuture = SupabaseService.instance.getWarungOrders();
      final accountsFuture = SupabaseService.instance.getAccounts();

      final orders = await ordersFuture;
      final accounts = await accountsFuture;

      if (mounted) {
        setState(() {
          _orders = orders;
          _accounts = accounts;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<WarungOrderModel> get _filteredOrders {
    if (_filter == 'kasbon') {
      return _orders.where((o) => o.isKasbon).toList();
    } else if (_filter == 'lunas') {
      return _orders.where((o) => o.isLunas).toList();
    }
    return _orders;
  }

  num get _totalAll => _orders.fold(0, (sum, o) => sum + o.totalAmount);
  num get _totalKasbon => _orders.where((o) => o.isKasbon).fold(0, (sum, o) => sum + o.totalAmount);
  num get _totalLunas => _orders.where((o) => o.isLunas).fold(0, (sum, o) => sum + o.totalAmount);

  int get _countKasbon => _orders.where((o) => o.isKasbon).length;
  int get _countLunas => _orders.where((o) => o.isLunas).length;

  void _openAddSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AddWarungOrderSheet(
        accounts: _accounts,
        onSaved: _loadData,
      ),
    );
  }

  Future<void> _markAsLunas(WarungOrderModel order) async {
    String? chosenAccount = _accounts.isNotEmpty ? _accounts.first.id : null;
    bool shouldDeduct = true;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Lunasi Kasbon Warung', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Tandai pesanan "${order.title}" (${CurrencyFormatter.formatRupiah(order.totalAmount)}) sebagai Lunas?',
                style: const TextStyle(fontSize: 13, color: NabangColors.textSecondary),
              ),
              const SizedBox(height: 14),
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                value: shouldDeduct,
                activeColor: NabangColors.primary,
                title: const Text('Potong otomatis dari saldo rekening', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                onChanged: (val) => setDialogState(() => shouldDeduct = val ?? true),
              ),
              if (shouldDeduct) ...[
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  value: chosenAccount,
                  isDense: true,
                  decoration: InputDecoration(
                    labelText: 'Pilih Rekening',
                    labelStyle: const TextStyle(fontSize: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  items: _accounts.map((acc) {
                    return DropdownMenuItem(
                      value: acc.id,
                      child: Text(
                        '${acc.name} (${CurrencyFormatter.formatRupiah(acc.currentBalance)})',
                        style: const TextStyle(fontSize: 12),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) => setDialogState(() => chosenAccount = val),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: NabangColors.success,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Lunasi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );

    if (confirmed == true) {
      try {
        await SupabaseService.instance.updateWarungOrderStatus(
          orderId: order.id,
          orderTitle: order.title,
          totalAmount: order.totalAmount,
          newStatus: 'lunas',
          accountId: shouldDeduct ? chosenAccount : null,
        );
        _loadData();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Pesanan berhasil ditandai Lunas!'),
              backgroundColor: NabangColors.success,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Gagal: $e'), backgroundColor: NabangColors.danger),
          );
        }
      }
    }
  }

  Future<void> _deleteOrder(WarungOrderModel order) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Catatan Warung?'),
        content: Text('Yakin ingin menghapus catatan "${order.title}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: NabangColors.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await SupabaseService.instance.deleteWarungOrder(order.id);
      _loadData();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NabangColors.background,
      appBar: AppBar(
        title: const Text('Catatan Warung', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: NabangColors.textPrimary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 22),
            onPressed: _loadData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: NabangColors.primary))
          : RefreshIndicator(
              onRefresh: _loadData,
              color: NabangColors.primary,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // 1. Kartu Ringkasan Metrik Finansial Warung
                    Row(
                      children: [
                        Expanded(
                          child: _buildSummaryCard(
                            label: 'Total Belanja',
                            amount: _totalAll,
                            count: _orders.length,
                            color: const Color(0xFF6B7280),
                            bgColor: const Color(0xFFF3F4F6),
                            icon: Icons.storefront,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildSummaryCard(
                            label: 'Kasbon (Hutang)',
                            amount: _totalKasbon,
                            count: _countKasbon,
                            color: const Color(0xFFBE123C),
                            bgColor: const Color(0xFFFFE4E6),
                            icon: Icons.receipt_long,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildSummaryCard(
                            label: 'Lunas',
                            amount: _totalLunas,
                            count: _countLunas,
                            color: const Color(0xFF047857),
                            bgColor: const Color(0xFFD1FAE5),
                            icon: Icons.check_circle_outline,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // 2. Filter Tabs
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildFilterChip('all', 'Semua (${_orders.length})'),
                          const SizedBox(width: 6),
                          _buildFilterChip('kasbon', 'Kasbon ($_countKasbon)'),
                          const SizedBox(width: 6),
                          _buildFilterChip('lunas', 'Lunas ($_countLunas)'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // 3. Daftar Pesanan
                    if (_filteredOrders.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: NabangColors.border),
                        ),
                        child: const Center(
                          child: Column(
                            children: [
                              Icon(Icons.receipt_outlined, size: 40, color: NabangColors.textSecondary),
                              SizedBox(height: 8),
                              Text('Belum ada catatan pesanan warung.', style: TextStyle(color: NabangColors.textSecondary, fontSize: 13)),
                              SizedBox(height: 4),
                              Text('Tekan tombol + di bawah untuk mencatat.', style: TextStyle(color: NabangColors.textSecondary, fontSize: 11)),
                            ],
                          ),
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _filteredOrders.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final order = _filteredOrders[index];
                          return _buildOrderCard(order);
                        },
                      ),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: NabangColors.primary,
        foregroundColor: Colors.white,
        onPressed: _openAddSheet,
        icon: const Icon(Icons.add),
        label: const Text('Catat Warung', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildSummaryCard({
    required String label,
    required num amount,
    required int count,
    required Color color,
    required Color bgColor,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color),
              ),
              Icon(icon, size: 14, color: color),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            CurrencyFormatter.formatRupiah(amount),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '$count pesanan',
            style: TextStyle(fontSize: 9.5, color: color.withOpacity(0.85)),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String id, String label) {
    final isSelected = _filter == id;
    return InkWell(
      onTap: () => setState(() => _filter = id),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? NabangColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? NabangColors.primary : NabangColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : NabangColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildOrderCard(WarungOrderModel order) {
    final dateStr = DateFormat('d MMM yyyy', 'id_ID').format(order.orderDate);

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
          // Row 1: Title & Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: NabangColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      dateStr,
                      style: const TextStyle(fontSize: 11, color: NabangColors.textSecondary),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                decoration: BoxDecoration(
                  color: order.isLunas ? const Color(0xFFD1FAE5) : const Color(0xFFFFE4E6),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  order.isLunas ? 'LUNAS' : 'KASBON',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: order.isLunas ? const Color(0xFF047857) : const Color(0xFFBE123C),
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Row 2: Rincian Item Menu
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF9FAFB),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final item in order.items)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${item.qty}x ${item.name}',
                          style: const TextStyle(fontSize: 11.5, color: NabangColors.textPrimary),
                        ),
                        Text(
                          CurrencyFormatter.formatRupiah(item.subtotal),
                          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: NabangColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Row 3: Total & Actions
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('Total: ', style: TextStyle(fontSize: 12, color: NabangColors.textSecondary)),
                  Text(
                    CurrencyFormatter.formatRupiah(order.totalAmount),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: order.isLunas ? const Color(0xFF047857) : const Color(0xFFBE123C),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  if (order.isKasbon)
                    ElevatedButton.icon(
                      onPressed: () => _markAsLunas(order),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: NabangColors.success,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        minimumSize: const Size(0, 32),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                      ),
                      icon: const Icon(Icons.check, size: 14),
                      label: const Text('Lunasi', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  const SizedBox(width: 4),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, size: 18, color: NabangColors.textSecondary),
                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    onPressed: () => _deleteOrder(order),
                  ),
                ],
              ),
            ],
          ),
          if (order.notes != null && order.notes!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              'Catatan: ${order.notes!}',
              style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: NabangColors.textSecondary),
            ),
          ],
        ],
      ),
    );
  }
}
