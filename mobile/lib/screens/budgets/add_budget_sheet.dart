import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../models/category_model.dart';
import '../../services/supabase_service.dart';

class AddBudgetSheet extends StatefulWidget {
  final List<CategoryModel> categories;
  final String currentMonth;
  final VoidCallback onSaved;

  const AddBudgetSheet({
    super.key,
    required this.categories,
    required this.currentMonth,
    required this.onSaved,
  });

  @override
  State<AddBudgetSheet> createState() => _AddBudgetSheetState();
}

class _AddBudgetSheetState extends State<AddBudgetSheet> {
  final _limitController = TextEditingController();
  String? _selectedCategoryId;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final expenseCats = widget.categories.where((c) => c.type == 'expense').toList();
    if (expenseCats.isNotEmpty) {
      _selectedCategoryId = expenseCats.first.id;
    }
  }

  @override
  void dispose() {
    _limitController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_selectedCategoryId == null) {
      setState(() => _errorMessage = 'Pilih kategori anggaran');
      return;
    }
    final limit = num.tryParse(_limitController.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
    if (limit <= 0) {
      setState(() => _errorMessage = 'Batas anggaran harus lebih dari 0');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await SupabaseService.instance.createOrUpdateBudget(
        categoryId: _selectedCategoryId!,
        month: widget.currentMonth,
        limitAmount: limit,
      );

      widget.onSaved();
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final expenseCats = widget.categories.where((c) => c.type == 'expense').toList();

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Atur Anggaran Bulanan',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                  constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: NabangColors.danger.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(_errorMessage!, style: const TextStyle(color: NabangColors.danger, fontSize: 13)),
              ),
              const SizedBox(height: 12),
            ],

            DropdownButtonFormField<String>(
              value: _selectedCategoryId,
              decoration: InputDecoration(
                labelText: 'Kategori Pengeluaran',
                filled: true,
                fillColor: NabangColors.background,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              items: expenseCats.map((c) {
                return DropdownMenuItem<String>(
                  value: c.id,
                  child: Text(c.name),
                );
              }).toList(),
              onChanged: (val) => setState(() => _selectedCategoryId = val),
            ),
            const SizedBox(height: 16),

            TextField(
              controller: _limitController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                prefixText: 'Rp ',
                labelText: 'Batas Maksimal Pengeluaran',
                hintText: '1.000.000',
                filled: true,
                fillColor: NabangColors.background,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),

            SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: NabangColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Simpan Anggaran', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
