import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/formatters/currency_formatter.dart';
import '../../models/account_model.dart';
import '../../models/category_model.dart';
import '../../models/transaction_model.dart';
import '../../services/supabase_service.dart';
import 'add_transaction_sheet.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  bool _isLoading = true;
  List<TransactionModel> _allTransactions = [];
  List<AccountModel> _accounts = [];
  List<CategoryModel> _categories = [];
  String _filterType = 'all'; // all, expense, income, transfer

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final txs = await SupabaseService.instance.getTransactions(limit: 100);
      final accs = await SupabaseService.instance.getAccounts();
      final cats = await SupabaseService.instance.getCategories();
      if (mounted) {
        setState(() {
          _allTransactions = txs;
          _accounts = accs;
          _categories = cats;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteTx(String id) async {
    try {
      await SupabaseService.instance.deleteTransaction(id);
      _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menghapus: $e')),
        );
      }
    }
  }

  void _openAddSheet() {
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
    final filtered = _filterType == 'all'
        ? _allTransactions
        : _allTransactions.where((t) => t.type == _filterType).toList();

    return Scaffold(
      backgroundColor: NabangColors.background,
      appBar: AppBar(
        title: const Text('Riwayat Transaksi', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: NabangColors.textPrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
            onPressed: _loadData,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddSheet,
        backgroundColor: NabangColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Catat Baru', style: TextStyle(fontWeight: FontWeight.w600)),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Filter row
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('all', 'Semua'),
                    const SizedBox(width: 8),
                    _buildFilterChip('expense', 'Pengeluaran'),
                    const SizedBox(width: 8),
                    _buildFilterChip('income', 'Pemasukan'),
                    const SizedBox(width: 8),
                    _buildFilterChip('transfer', 'Transfer'),
                  ],
                ),
              ),
            ),
            const Divider(height: 1, color: NabangColors.border),

            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: NabangColors.primary))
                  : filtered.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.receipt_long_outlined, size: 54, color: NabangColors.textSecondary.withOpacity(0.5)),
                              const SizedBox(height: 12),
                              const Text('Belum ada transaksi', style: TextStyle(color: NabangColors.textSecondary, fontSize: 15)),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          color: NabangColors.primary,
                          onRefresh: _loadData,
                          child: ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: filtered.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (context, index) {
                              final tx = filtered[index];
                              final isIncome = tx.type == 'income';
                              final isTransfer = tx.type == 'transfer';

                              return Dismissible(
                                key: Key(tx.id),
                                direction: DismissDirection.endToStart,
                                background: Container(
                                  alignment: Alignment.centerRight,
                                  padding: const EdgeInsets.only(right: 20),
                                  decoration: BoxDecoration(
                                    color: NabangColors.danger,
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: const Icon(Icons.delete_outline, color: Colors.white),
                                ),
                                confirmDismiss: (_) async {
                                  return await showDialog(
                                    context: context,
                                    builder: (ctx) => AlertDialog(
                                      title: const Text('Hapus Transaksi?'),
                                      content: const Text('Apakah Anda yakin ingin menghapus catatan transaksi ini?'),
                                      actions: [
                                        TextButton(
                                          onPressed: () => Navigator.pop(ctx, false),
                                          child: const Text('Batal'),
                                        ),
                                        ElevatedButton(
                                          onPressed: () => Navigator.pop(ctx, true),
                                          style: ElevatedButton.styleFrom(backgroundColor: NabangColors.danger),
                                          child: const Text('Hapus', style: TextStyle(color: Colors.white)),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                                onDismissed: (_) => _deleteTx(tx.id),
                                child: Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(color: NabangColors.border),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 40,
                                        height: 40,
                                        decoration: BoxDecoration(
                                          color: isTransfer
                                              ? Colors.blue.withOpacity(0.1)
                                              : isIncome
                                                  ? NabangColors.success.withOpacity(0.1)
                                                  : NabangColors.danger.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Icon(
                                          isTransfer
                                              ? Icons.swap_horiz
                                              : isIncome
                                                  ? Icons.arrow_downward
                                                  : Icons.arrow_upward,
                                          size: 18,
                                          color: isTransfer
                                              ? Colors.blue
                                              : isIncome
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
                                                  : (tx.categoryName ?? (isTransfer ? 'Transfer Rekening' : 'Transaksi')),
                                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                                            ),
                                            const SizedBox(height: 3),
                                            Text(
                                              '${CurrencyFormatter.formatDate(tx.occurredAt)} • ${tx.accountName ?? "Akun"}',
                                              style: const TextStyle(fontSize: 12, color: NabangColors.textSecondary),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Text(
                                        '${isIncome ? '+' : isTransfer ? '' : '-'}${CurrencyFormatter.formatRupiah(tx.amount)}',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14,
                                          color: isIncome
                                              ? NabangColors.success
                                              : isTransfer
                                                  ? Colors.blue
                                                  : NabangColors.danger,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _filterType == key;
    return GestureDetector(
      onTap: () => setState(() => _filterType = key),
      child: Container(
        constraints: const BoxConstraints(minHeight: 44),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? NabangColors.primary : NabangColors.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? NabangColors.primary : NabangColors.border),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : NabangColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
