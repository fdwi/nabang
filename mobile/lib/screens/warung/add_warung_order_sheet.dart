import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/constants/colors.dart';
import '../../core/formatters/currency_formatter.dart';
import '../../models/account_model.dart';
import '../../models/warung_model.dart';
import '../../services/supabase_service.dart';

class _ItemRowData {
  final TextEditingController nameController;
  final TextEditingController qtyController;
  final TextEditingController priceController;

  _ItemRowData({String defaultName = '', int defaultQty = 1, num defaultPrice = 0})
      : nameController = TextEditingController(text: defaultName),
        qtyController = TextEditingController(text: defaultQty.toString()),
        priceController = TextEditingController(text: defaultPrice > 0 ? defaultPrice.toInt().toString() : '');

  int get qty => int.tryParse(qtyController.text) ?? 1;
  num get price => num.tryParse(priceController.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;
  num get subtotal => qty * price;

  void dispose() {
    nameController.dispose();
    qtyController.dispose();
    priceController.dispose();
  }
}

class AddWarungOrderSheet extends StatefulWidget {
  final List<AccountModel> accounts;
  final VoidCallback onSaved;

  const AddWarungOrderSheet({
    super.key,
    required this.accounts,
    required this.onSaved,
  });

  @override
  State<AddWarungOrderSheet> createState() => _AddWarungOrderSheetState();
}

class _AddWarungOrderSheetState extends State<AddWarungOrderSheet> {
  final _titleController = TextEditingController(text: 'Warung Makan');
  final _notesController = TextEditingController();

  DateTime _orderDate = DateTime.now();
  String _paymentStatus = 'kasbon'; // 'kasbon' | 'lunas'
  String? _selectedAccountId;
  bool _isLoading = false;
  String? _errorMessage;

  final List<_ItemRowData> _items = [
    _ItemRowData(defaultName: 'Es Teh Manis', defaultQty: 1, defaultPrice: 3000),
  ];

  @override
  void initState() {
    super.initState();
    if (widget.accounts.isNotEmpty) {
      _selectedAccountId = widget.accounts.first.id;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _notesController.dispose();
    for (final item in _items) {
      item.dispose();
    }
    super.dispose();
  }

  num get _totalAmount {
    num sum = 0;
    for (final it in _items) {
      sum += it.subtotal;
    }
    return sum;
  }

  void _addItem() {
    setState(() {
      _items.add(_ItemRowData());
    });
  }

  void _removeItem(int index) {
    if (_items.length <= 1) return;
    setState(() {
      final removed = _items.removeAt(index);
      removed.dispose();
    });
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _orderDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: NabangColors.primary,
              onPrimary: Colors.white,
              onSurface: NabangColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _orderDate = picked);
    }
  }

  Future<void> _submit() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      setState(() => _errorMessage = 'Nama warung / judul pesanan wajib diisi');
      return;
    }

    final validItems = <WarungOrderItem>[];
    for (final row in _items) {
      final name = row.nameController.text.trim();
      if (name.isNotEmpty && row.price > 0) {
        validItems.add(WarungOrderItem(
          name: name,
          qty: row.qty > 0 ? row.qty : 1,
          price: row.price,
        ));
      }
    }

    if (validItems.isEmpty) {
      setState(() => _errorMessage = 'Masukkan minimal satu menu item dengan harga valid');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await SupabaseService.instance.createWarungOrder(
        title: title,
        notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
        items: validItems,
        totalAmount: _totalAmount,
        paymentStatus: _paymentStatus,
        accountId: _paymentStatus == 'lunas' ? _selectedAccountId : null,
        orderDate: _orderDate,
      );

      widget.onSaved();
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _paymentStatus == 'lunas'
                ? 'Pesanan berhasil dicatat dan saldo otomatis terpotong!'
                : 'Pesanan kasbon berhasil dicatat!',
            ),
            backgroundColor: NabangColors.success,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Gagal menyimpan pesanan: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        left: 20,
        right: 20,
        top: 16,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: NabangColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.restaurant, color: NabangColors.primary, size: 22),
                    SizedBox(width: 8),
                    Text(
                      'Catat Pesanan Warung',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: NabangColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: NabangColors.textSecondary, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (_errorMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: NabangColors.danger.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(color: NabangColors.danger, fontSize: 12),
                ),
              ),

            // 1. Nama Warung / Judul
            const Text(
              'NAMA WARUNG / TEMPAT JAJAN',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: NabangColors.textSecondary, letterSpacing: 0.5),
            ),
            const SizedBox(height: 6),
            TextFormField(
              controller: _titleController,
              decoration: InputDecoration(
                hintText: 'Contoh: Warung Bu Sri, Kantin Kantor',
                filled: true,
                fillColor: NabangColors.inputBackground,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: NabangColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: NabangColors.border)),
              ),
            ),
            const SizedBox(height: 14),

            // 2. Tanggal Pesanan
            const Text(
              'TANGGAL PESANAN',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: NabangColors.textSecondary, letterSpacing: 0.5),
            ),
            const SizedBox(height: 6),
            InkWell(
              onTap: _pickDate,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: NabangColors.inputBackground,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: NabangColors.border),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(_orderDate),
                      style: const TextStyle(fontSize: 13, color: NabangColors.textPrimary, fontWeight: FontWeight.w600),
                    ),
                    const Icon(Icons.calendar_today, size: 16, color: NabangColors.primary),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 3. Daftar Item / Menu
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'RINCIAN MENU / ITEM',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: NabangColors.textSecondary, letterSpacing: 0.5),
                ),
                TextButton.icon(
                  onPressed: _addItem,
                  icon: const Icon(Icons.add, size: 14),
                  label: const Text('Tambah Menu', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  style: TextButton.styleFrom(
                    foregroundColor: NabangColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    minimumSize: const Size(0, 32),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),

            // Dynamic item rows
            for (int i = 0; i < _items.length; i++) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: NabangColors.border),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          flex: 3,
                          child: TextFormField(
                            controller: _items[i].nameController,
                            style: const TextStyle(fontSize: 12),
                            decoration: InputDecoration(
                              hintText: 'Nama Menu (cth: Es Teh)',
                              isDense: true,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              filled: true,
                              fillColor: Colors.white,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: NabangColors.border)),
                              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: NabangColors.border)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        if (_items.length > 1)
                          InkWell(
                            onTap: () => _removeItem(i),
                            child: const Padding(
                              padding: EdgeInsets.all(4.0),
                              child: Icon(Icons.delete_outline, size: 18, color: NabangColors.danger),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: TextFormField(
                            controller: _items[i].qtyController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(fontSize: 12),
                            onChanged: (_) => setState(() {}),
                            decoration: InputDecoration(
                              labelText: 'Qty',
                              isDense: true,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              filled: true,
                              fillColor: Colors.white,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: NabangColors.border)),
                              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: NabangColors.border)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          flex: 3,
                          child: TextFormField(
                            controller: _items[i].priceController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(fontSize: 12),
                            onChanged: (_) => setState(() {}),
                            decoration: InputDecoration(
                              labelText: 'Harga Satuan (Rp)',
                              isDense: true,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              filled: true,
                              fillColor: Colors.white,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: NabangColors.border)),
                              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: NabangColors.border)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          flex: 3,
                          child: Text(
                            CurrencyFormatter.formatRupiah(_items[i].subtotal),
                            textAlign: TextAlign.right,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NabangColors.primaryDark),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],

            // Total box
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFECDD3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total Pembayaran:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NabangColors.textPrimary)),
                  Text(
                    CurrencyFormatter.formatRupiah(_totalAmount),
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFFBE123C)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 4. Status Pembayaran
            const Text(
              'STATUS PEMBAYARAN',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: NabangColors.textSecondary, letterSpacing: 0.5),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _paymentStatus = 'kasbon'),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _paymentStatus == 'kasbon' ? const Color(0xFFFFE4E6) : Colors.white,
                        border: Border.all(
                          color: _paymentStatus == 'kasbon' ? NabangColors.danger : NabangColors.border,
                          width: _paymentStatus == 'kasbon' ? 1.5 : 1,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.receipt_outlined,
                            size: 16,
                            color: _paymentStatus == 'kasbon' ? NabangColors.danger : NabangColors.textSecondary,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Kasbon (Belum Bayar)',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: _paymentStatus == 'kasbon' ? NabangColors.danger : NabangColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _paymentStatus = 'lunas'),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _paymentStatus == 'lunas' ? const Color(0xFFD1FAE5) : Colors.white,
                        border: Border.all(
                          color: _paymentStatus == 'lunas' ? NabangColors.success : NabangColors.border,
                          width: _paymentStatus == 'lunas' ? 1.5 : 1,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.check_circle_outline,
                            size: 16,
                            color: _paymentStatus == 'lunas' ? NabangColors.success : NabangColors.textSecondary,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Lunas',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: _paymentStatus == 'lunas' ? NabangColors.success : NabangColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Jika Lunas: Opsi Auto-potong Rekening
            if (_paymentStatus == 'lunas') ...[
              const Text(
                'POTONG OTOMATIS DARI REKENING',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: NabangColors.textSecondary, letterSpacing: 0.5),
              ),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _selectedAccountId,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: NabangColors.inputBackground,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: NabangColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: NabangColors.border)),
                ),
                hint: const Text('Pilih Rekening (Opsional)', style: TextStyle(fontSize: 12)),
                items: widget.accounts.map((acc) {
                  return DropdownMenuItem(
                    value: acc.id,
                    child: Text(
                      '${acc.name} (${CurrencyFormatter.formatRupiah(acc.currentBalance)})',
                      style: const TextStyle(fontSize: 12),
                    ),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _selectedAccountId = val),
              ),
              const SizedBox(height: 12),
            ],

            // 5. Catatan Tambahan (Opsional)
            const Text(
              'CATATAN TAMBAHAN (OPSIONAL)',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: NabangColors.textSecondary, letterSpacing: 0.5),
            ),
            const SizedBox(height: 6),
            TextFormField(
              controller: _notesController,
              decoration: InputDecoration(
                hintText: 'Misal: Titip beli punya teman kantor',
                filled: true,
                fillColor: NabangColors.inputBackground,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: NabangColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: NabangColors.border)),
              ),
            ),
            const SizedBox(height: 20),

            // Tombol Simpan
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: NabangColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: _isLoading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Simpan Pesanan Warung', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            ),
          ],
        ),
      ),
    );
  }
}
