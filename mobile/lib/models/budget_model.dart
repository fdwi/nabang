class BudgetModel {
  final String id;
  final String categoryId;
  final String categoryName;
  final String month; // YYYY-MM
  final num limitAmount;
  final num spentAmount;

  BudgetModel({
    required this.id,
    required this.categoryId,
    required this.categoryName,
    required this.month,
    required this.limitAmount,
    required this.spentAmount,
  });

  double get usagePercentage {
    if (limitAmount <= 0) return 0.0;
    return (spentAmount / limitAmount) * 100;
  }

  bool get isOverBudget => spentAmount > limitAmount;

  factory BudgetModel.fromJson(Map<String, dynamic> json, {num? calculatedSpent}) {
    return BudgetModel(
      id: json['id'] as String,
      categoryId: json['category_id'] as String,
      categoryName: json['categories'] != null
          ? (json['categories']['name'] as String? ?? 'Umum')
          : (json['category_name'] as String? ?? 'Umum'),
      month: json['month'] as String,
      limitAmount: (json['limit_amount'] as num?) ?? 0,
      spentAmount: calculatedSpent ?? ((json['spent_amount'] as num?) ?? 0),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'category_id': categoryId,
      'month': month,
      'limit_amount': limitAmount,
    };
  }
}
