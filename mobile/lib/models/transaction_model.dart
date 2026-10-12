class TransactionModel {
  final String id;
  final String accountId;
  final String? destinationAccountId;
  final String? categoryId;
  final String type; // income, expense, transfer
  final num amount;
  final DateTime occurredAt;
  final String? description;
  final String? accountName;
  final String? destinationAccountName;
  final String? categoryName;

  TransactionModel({
    required this.id,
    required this.accountId,
    this.destinationAccountId,
    this.categoryId,
    required this.type,
    required this.amount,
    required this.occurredAt,
    this.description,
    this.accountName,
    this.destinationAccountName,
    this.categoryName,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    final dateStr = (json['occurred_at'] ?? json['transaction_date'] ?? DateTime.now().toIso8601String()) as String;
    return TransactionModel(
      id: json['id'] as String,
      accountId: json['account_id'] as String,
      destinationAccountId: json['destination_account_id'] as String?,
      categoryId: json['category_id'] as String?,
      type: json['type'] as String,
      amount: (json['amount'] as num?) ?? 0,
      occurredAt: DateTime.tryParse(dateStr) ?? DateTime.now(),
      description: (json['description'] ?? json['note']) as String?,
      accountName: json['accounts'] != null ? json['accounts']['name'] as String? : null,
      destinationAccountName: json['destination_account'] != null
          ? json['destination_account']['name'] as String?
          : null,
      categoryName: json['categories'] != null ? json['categories']['name'] as String? : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'account_id': accountId,
      'destination_account_id': destinationAccountId,
      'category_id': categoryId,
      'type': type,
      'amount': amount,
      'occurred_at': occurredAt.toIso8601String(),
      'description': description,
    };
  }
}
