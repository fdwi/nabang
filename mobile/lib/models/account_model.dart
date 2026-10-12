class AccountModel {
  final String id;
  final String name;
  final String accountType; // cash, bank, ewallet, other
  final num openingBalance;
  final num currentBalance;
  final bool isActive;

  AccountModel({
    required this.id,
    required this.name,
    required this.accountType,
    required this.openingBalance,
    required this.currentBalance,
    required this.isActive,
  });

  factory AccountModel.fromJson(Map<String, dynamic> json, {num? calculatedBalance}) {
    final opening = (json['opening_balance'] ?? json['initial_balance'] ?? 0) as num;
    return AccountModel(
      id: json['id'] as String,
      name: json['name'] as String,
      accountType: (json['account_type'] ?? json['type'] ?? 'cash') as String,
      openingBalance: opening,
      currentBalance: calculatedBalance ?? (json['current_balance'] ?? opening) as num,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'account_type': accountType,
      'opening_balance': openingBalance,
      'is_active': isActive,
    };
  }

  AccountModel copyWith({
    String? id,
    String? name,
    String? accountType,
    num? openingBalance,
    num? currentBalance,
    bool? isActive,
  }) {
    return AccountModel(
      id: id ?? this.id,
      name: name ?? this.name,
      accountType: accountType ?? this.accountType,
      openingBalance: openingBalance ?? this.openingBalance,
      currentBalance: currentBalance ?? this.currentBalance,
      isActive: isActive ?? this.isActive,
    );
  }
}
