import 'dart:convert';

class WarungOrderItem {
  final String name;
  final int qty;
  final num price;

  const WarungOrderItem({
    required this.name,
    required this.qty,
    required this.price,
  });

  num get subtotal => qty * price;

  factory WarungOrderItem.fromJson(Map<String, dynamic> json) {
    return WarungOrderItem(
      name: (json['name'] as String?)?.trim() ?? '',
      qty: (json['qty'] as num?)?.toInt() ?? 1,
      price: (json['price'] as num?) ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'qty': qty,
      'price': price,
    };
  }
}

class WarungOrderModel {
  final String id;
  final String userId;
  final String title;
  final String? notes;
  final List<WarungOrderItem> items;
  final num totalAmount;
  final String paymentStatus; // 'kasbon' | 'lunas'
  final String? accountId;
  final DateTime orderDate;
  final DateTime? createdAt;

  const WarungOrderModel({
    required this.id,
    required this.userId,
    required this.title,
    this.notes,
    required this.items,
    required this.totalAmount,
    required this.paymentStatus,
    this.accountId,
    required this.orderDate,
    this.createdAt,
  });

  bool get isKasbon => paymentStatus == 'kasbon';
  bool get isLunas => paymentStatus == 'lunas';

  factory WarungOrderModel.fromJson(Map<String, dynamic> json) {
    List<WarungOrderItem> parsedItems = [];
    final rawItems = json['items'];
    if (rawItems is List) {
      parsedItems = rawItems
          .map((item) => WarungOrderItem.fromJson(item as Map<String, dynamic>))
          .toList();
    } else if (rawItems is String) {
      try {
        final decoded = jsonDecode(rawItems);
        if (decoded is List) {
          parsedItems = decoded
              .map((item) => WarungOrderItem.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      } catch (_) {}
    }

    return WarungOrderModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      title: (json['title'] as String?) ?? 'Pesanan Warung',
      notes: json['notes'] as String?,
      items: parsedItems,
      totalAmount: (json['total_amount'] as num?) ?? 0,
      paymentStatus: (json['payment_status'] as String?) ?? 'kasbon',
      accountId: json['account_id'] as String?,
      orderDate: DateTime.tryParse(json['order_date'] as String? ?? '') ?? DateTime.now(),
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'] as String) : null,
    );
  }
}
