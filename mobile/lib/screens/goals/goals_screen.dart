import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/formatters/currency_formatter.dart';
import '../../models/goal_model.dart';
import '../../services/supabase_service.dart';
import 'add_goal_sheet.dart';

class GoalsScreen extends StatefulWidget {
  const GoalsScreen({super.key});

  @override
  State<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends State<GoalsScreen> {
  bool _isLoading = true;
  List<GoalModel> _goals = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final goals = await SupabaseService.instance.getGoals();
      if (mounted) {
        setState(() {
          _goals = goals;
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
      builder: (_) => AddGoalSheet(onSaved: _loadData),
    );
  }

  void _showDepositDialog(GoalModel goal) {
    final amountController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Nabung ke "${goal.name}"'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: amountController,
              keyboardType: TextInputType.number,
              autofocus: true,
              decoration: const InputDecoration(
                prefixText: 'Rp ',
                labelText: 'Jumlah Tabungan',
                hintText: '50.000',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: NabangColors.primary),
            onPressed: () async {
              final amt = num.tryParse(amountController.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
              if (amt > 0) {
                Navigator.pop(ctx);
                await SupabaseService.instance.addGoalContribution(
                  goalId: goal.id,
                  amount: amt,
                );
                _loadData();
              }
            },
            child: const Text('Simpan', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    num totalTarget = 0;
    num totalCollected = 0;
    for (final g in _goals) {
      totalTarget += g.targetAmount;
      totalCollected += g.currentAmount;
    }

    return Scaffold(
      backgroundColor: NabangColors.background,
      appBar: AppBar(
        title: const Text('Target Impian', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
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
        label: const Text('Target Baru', style: TextStyle(fontWeight: FontWeight.w600)),
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
                    // Header Card
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
                              const Text('Total Terkumpul', style: TextStyle(color: NabangColors.textSecondary, fontSize: 12)),
                              Text(
                                '${_goals.length} Impian',
                                style: const TextStyle(color: NabangColors.primary, fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            CurrencyFormatter.formatRupiah(totalCollected),
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: NabangColors.primaryDark),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'dari target total ${CurrencyFormatter.formatRupiah(totalTarget)}',
                            style: const TextStyle(fontSize: 12, color: NabangColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),

                    if (_goals.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: NabangColors.border),
                        ),
                        child: const Center(
                          child: Text('Belum ada target impian yang dibuat.', style: TextStyle(color: NabangColors.textSecondary)),
                        ),
                      )
                    else
                      ..._goals.map((goal) {
                        final progress = goal.progressPercentage;
                        final isCompleted = progress >= 100;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 14),
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
                                  Expanded(
                                    child: Text(
                                      goal.name,
                                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isCompleted
                                          ? NabangColors.success.withOpacity(0.1)
                                          : NabangColors.primary.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      '${progress.toStringAsFixed(1)}%',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: isCompleted ? NabangColors.success : NabangColors.primary,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(6),
                                child: LinearProgressIndicator(
                                  value: (progress / 100).clamp(0.0, 1.0),
                                  minHeight: 8,
                                  backgroundColor: NabangColors.background,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    isCompleted ? NabangColors.success : NabangColors.primary,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        CurrencyFormatter.formatRupiah(goal.currentAmount),
                                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                                      ),
                                      Text(
                                        'Target: ${CurrencyFormatter.formatRupiah(goal.targetAmount)}',
                                        style: const TextStyle(fontSize: 11, color: NabangColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                  ElevatedButton.icon(
                                    onPressed: () => _showDepositDialog(goal),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: NabangColors.primary,
                                      foregroundColor: Colors.white,
                                      elevation: 0,
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    icon: const Icon(Icons.add, size: 16),
                                    label: const Text('Nabung', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
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
