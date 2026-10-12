import 'package:flutter/material.dart';
import '../../core/constants/colors.dart';
import '../../core/formatters/currency_formatter.dart';
import '../../models/account_model.dart';
import '../../models/category_model.dart';
import '../../services/supabase_service.dart';

class AddTransactionSheet extends StatefulWidget {
  final List<AccountModel> accounts;
  final List<CategoryModel> categories;
  final VoidCallback onSaved;

  const AddTransactionSheet({
    super.key,
    required this.accounts,
    required this.categories,
    required this.onSaved,
  });

  @override
  State<AddTransactionSheet> createState() => _AddTransactionSheetState();
}

class _AddTransactionSheetState extends State<AddTransactionSheet> {
  final _amountController = TextEditingController();
  final _descController = TextEditingController();

  String _type = 'expense'; // expense, income, transfer
  String? _selectedAccountId;
  String? _selectedDestAccountId;
  String? _selectedCategoryId;
  DateTime _selectedDate = DateTime.now();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    if (widget.accounts.isNotEmpty) {
      _selectedAccountId = widget.accounts.first.id;
      if (widget.accounts.length > 1) {
        _selectedDestAccountId = widget.accounts[1].id;
      }
    }
    final filteredCategories = widget.categories.where((c) => c.type == _type).toList();
    if (filteredCategories.isNotEmpty) {
      _selectedCategoryId = filteredCategories.first.id;
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _descController.dispose();
    super.dispose();
  }

  void _onTypeChanged(String newType) {
    setState(() {
      _type = newType;
      final filtered = widget.categories.where((c) => c.type == _type).toList();
      _selectedCategoryId = filtered.isNotEmpty ? filtered.first.id : null;
    });
  }

  Future<void> _submit() async {
    final amountVal = num.tryParse(_amountController.text.replaceAll(RegExp(r'[^0-9]'), ''));
    if (amountVal == null || amountVal <= 0) {
      setState(() => _errorMessage = 'Nominal harus lebih dari 0');
      return;
    }
    if (_selectedAccountId == null) {
      setState(() => _errorMessage = 'Pilih akun sumber');
      return;
    }
    if (_type == 'transfer' && _selectedDestAccountId == null) {
      setState(() => _errorMessage = 'Pilih akun tujuan');
      return;
    }
    if (_type == 'transfer' && _selectedAccountId == _selectedDestAccountId) {
      setState(() => _errorMessage = 'Akun tujuan tidak boleh sama dengan akun sumber');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await SupabaseService.instance.createTransaction(
        type: _type,
        amount: amountVal,
        accountId: _selectedAccountId!,
        destinationAccountId: _type == 'transfer' ? _selectedDestAccountId : null,
        categoryId: _type != 'transfer' ? _selectedCategoryId : null,
        description: _descController.text,
        occurredAt: _selectedDate,
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
    final filteredCategories = widget.categories.where((c) => c.type == _type).toList();

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
                  'Catat Transaksi',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: NabangColors.textPrimary,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: NabangColors.textSecondary),
                  constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Segmented Type Selector
            Row(
              children: [
                _buildTypeButton('expense', 'Pengeluaran', Icons.arrow_upward_rounded),
                const SizedBox(width: 8),
                _buildTypeButton('income', 'Pemasukan', Icons.arrow_downward_rounded),
                const SizedBox(width: 8),
                _buildTypeButton('transfer', 'Transfer', Icons.swap_horiz_rounded),
              ],
            ),
            const SizedBox(height: 20),

            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: NabangColors.danger.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(color: NabangColors.danger, fontSize: 13),
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Amount Input
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                prefixText: 'Rp ',
                prefixStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: NabangColors.textSecondary),
                labelText: 'Jumlah',
                filled: true,
                fillColor: NabangColors.background,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: NabangColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: NabangColors.border),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Source Account Dropdown
            DropdownButtonFormField<String>(
              value: _selectedAccountId,
              decoration: InputDecoration(
                labelText: _type == 'transfer' ? 'Dari Rekening/Dompet' : 'Rekening/Dompet',
                filled: true,
                fillColor: NabangColors.background,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              items: widget.accounts.map((a) {
                return DropdownMenuItem<String>(
                  value: a.id,
                  child: Text(a.name),
                );
              }).toList(),
              onChanged: (val) => setState(() => _selectedAccountId = val),
            ),
            const SizedBox(height: 16),

            // Destination Account (for Transfer)
            if (_type == 'transfer') ...[
              DropdownButtonFormField<String>(
                value: _selectedDestAccountId,
                decoration: InputDecoration(
                  labelText: 'Ke Rekening/Dompet Tujuan',
                  filled: true,
                  fillColor: NabangColors.background,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                items: widget.accounts.map((a) {
                  return DropdownMenuItem<String>(
                    value: a.id,
                    child: Text(a.name),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _selectedDestAccountId = val),
              ),
              const SizedBox(height: 16),
            ],

            // Category (for income and expense)
            if (_type != 'transfer') ...[
              DropdownButtonFormField<String>(
                value: _selectedCategoryId,
                decoration: InputDecoration(
                  labelText: 'Kategori',
                  filled: true,
                  fillColor: NabangColors.background,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                items: filteredCategories.map((c) {
                  return DropdownMenuItem<String>(
                    value: c.id,
                    child: Text(c.name),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _selectedCategoryId = val),
              ),
              const SizedBox(height: 16),
            ],

            // Description Input
            TextField(
              controller: _descController,
              decoration: InputDecoration(
                labelText: 'Catatan (Opsional)',
                hintText: 'Contoh: Makan siang, Gaji bulanan',
                filled: true,
                fillColor: NabangColors.background,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),

            // Date Picker
            InkWell(
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: _selectedDate,
                  firstDate: DateTime(2020),
                  lastDate: DateTime.now().add(const Duration(days: 365)),
                );
                if (picked != null) setState(() => _selectedDate = picked);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                decoration: BoxDecoration(
                  color: NabangColors.background,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: NabangColors.border),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Tanggal: ${CurrencyFormatter.formatDate(_selectedDate)}',
                      style: const TextStyle(fontSize: 14, color: NabangColors.textPrimary),
                    ),
                    const Icon(Icons.calendar_today, size: 18, color: NabangColors.textSecondary),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
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
                    : const Text(
                        'Simpan Transaksi',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeButton(String typeKey, String label, IconData icon) {
    final isSelected = _type == typeKey;
    return Expanded(
      child: GestureDetector(
        onTap: () => _onTypeChanged(typeKey),
        child: Container(
          constraints: const BoxConstraints(minHeight: 44),
          decoration: BoxDecoration(
            color: isSelected ? NabangColors.primary : NabangColors.background,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? NabangColors.primary : NabangColors.border,
            ),
          ),
          alignment: Alignment.center,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 16,
                color: isSelected ? Colors.white : NabangColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? Colors.white : NabangColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
