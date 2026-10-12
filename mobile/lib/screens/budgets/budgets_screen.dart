import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/formatters/currency_formatter.dart';
import '../../models/budget_model.dart';
import '../../models/category_model.dart';
import '../../services/supabase_service.dart';
import 'add_budget_sheet.dart';

class BudgetsScreen extends StatefulWidget {
  const BudgetsScreen({super.key});

  @override
  State<BudgetsScreen> createState() => _BudgetsScreenState();
}

class _BudgetsScreenState extends State<BudgetsScreen> {
  bool _isLoading = true;
  List<BudgetModel> _budgets = [];
  List<CategoryModel> _categories = [];
  late String _currentMonth;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _currentMonth = '${now.year}-${now.month.toString().padLeft(2, '0')}';
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final budgets = await SupabaseService.instance.getBudgets(month: _currentMonth);
      final categories = await SupabaseService.instance.getCategories();
      if (mounted) {
        setState(() {
          _budgets = budgets;
          _categories = categories;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _openAddSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AddBudgetSheet(
        categories: _categories,
        currentMonth: _currentMonth,
        onSaved: _loadData,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    num totalLimit = 0;
    num totalSpent = 0;
    for (final b in _budgets) {
      totalLimit += b.limitAmount;
      totalSpent += b.spentAmount;
    }

    return Scaffold(
      backgroundColor: NabangColors.background,
      appBar: AppBar(
        title: const Text('Anggaran Bulanan', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
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
        label: const Text('Atur Anggaran', style: TextStyle(fontWeight: FontWeight.w600)),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: NabangColors.primary))
            : RefreshIndicator(
                color: NabangColors.primary,
                onRefresh: _loadData,
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Month & Summary card
                    Container(
                      padding: const EdgeInsets.all(18),
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
                              Text(
                                'Periode $_currentMonth',
                                style: const TextStyle(color: NabangColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w500),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: NabangColors.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${_budgets.length} Kategori',
                                  style: const TextStyle(color: NabangColors.primary, fontWeight: FontWeight.bold, fontSize: 11),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Terpakai', style: TextStyle(fontSize: 11, color: NabangColors.textSecondary)),
                                  Text(
                                    CurrencyFormatter.formatRupiah(totalSpent),
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: NabangColors.textPrimary),
                                  ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  const Text('Total Plafon', style: TextStyle(fontSize: 11, color: NabangColors.textSecondary)),
                                  Text(
                                    CurrencyFormatter.formatRupiah(totalLimit),
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: NabangColors.primaryDark),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),

                    if (_budgets.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: NabangColors.border),
                        ),
                        child: const Center(
                          child: Text('Belum ada batasan anggaran yang diset untuk bulan ini.', style: TextStyle(color: NabangColors.textSecondary)),
                        ),
                      )
                    else
                      ..._budgets.map((b) {
                        final usage = b.usagePercentage;
                        final isOver = b.isOverBudget;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isOver ? NabangColors.danger.withOpacity(0.5) : NabangColors.border,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    b.categoryName,
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                                  ),
                                  Text(
                                    isOver ? 'Melebihi Anggaran!' : '${usage.toStringAsFixed(0)}%',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                      color: isOver ? NabangColors.danger : NabangColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(6),
                                child: LinearProgressIndicator(
                                  value: (usage / 100).clamp(0.0, 1.0),
                                  minHeight: 7,
                                  backgroundColor: NabangColors.background,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    isOver ? NabangColors.danger : NabangColors.primary,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Terpakai: ${CurrencyFormatter.formatRupiah(b.spentAmount)}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: isOver ? NabangColors.danger : NabangColors.textSecondary,
                                      fontWeight: isOver ? FontWeight.bold : FontWeight.normal,
                                    ),
                                  ),
                                  Text(
                                    'Batas: ${CurrencyFormatter.formatRupiah(b.limitAmount)}',
                                    style: const TextStyle(fontSize: 12, color: NabangColors.textSecondary),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      }),
                  ],
                ),
              ),
      ),
    );
  }
}
