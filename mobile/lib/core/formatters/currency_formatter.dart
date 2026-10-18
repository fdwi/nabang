import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final NumberFormat _formatter = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  static String formatRupiah(num amount) {
    try {
      return _formatter.format(amount);
    } catch (_) {
      return 'Rp ${amount.toStringAsFixed(0)}';
    }
  }

  static String formatDate(DateTime date) {
    try {
      return DateFormat('d MMM yyyy', 'id_ID').format(date);
    } catch (_) {
      return '${date.day} ${_getMonthName(date.month)} ${date.year}';
    }
  }

  static String formatDateTime(DateTime date) {
    try {
      return DateFormat('d MMM yyyy, HH:mm', 'id_ID').format(date);
    } catch (_) {
      return '${date.day} ${_getMonthName(date.month)} ${date.year}, ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    }
  }

  static String _getMonthName(int month) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    if (month >= 1 && month <= 12) return months[month - 1];
    return '$month';
  }

  static num parseNum(dynamic val, [num defaultValue = 0]) {
    if (val == null) return defaultValue;
    if (val is num) return val;
    if (val is String) return num.tryParse(val) ?? defaultValue;
    return defaultValue;
  }
}
