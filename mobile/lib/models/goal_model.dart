class GoalModel {
  final String id;
  final String name;
  final num targetAmount;
  final num initialAmount;
  final num currentAmount;
  final DateTime? deadline;
  final String status; // active, completed, paused, cancelled
  final String? color;

  GoalModel({
    required this.id,
    required this.name,
    required this.targetAmount,
    required this.initialAmount,
    required this.currentAmount,
    this.deadline,
    required this.status,
    this.color,
  });

  double get progressPercentage {
    if (targetAmount <= 0) return 0.0;
    final pct = (currentAmount / targetAmount) * 100;
    return pct.clamp(0.0, 100.0);
  }

  factory GoalModel.fromJson(Map<String, dynamic> json, {num? calculatedContributions}) {
    final initial = (json['initial_amount'] as num?) ?? 0;
    final total = initial + (calculatedContributions ?? 0);
    return GoalModel(
      id: json['id'] as String,
      name: json['name'] as String,
      targetAmount: (json['target_amount'] as num?) ?? 0,
      initialAmount: initial,
      currentAmount: (json['current_amount'] ?? total) as num,
      deadline: json['deadline'] != null ? DateTime.tryParse(json['deadline'] as String) : null,
      status: json['status'] as String? ?? 'active',
      color: json['color'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'target_amount': targetAmount,
      'initial_amount': initialAmount,
      'deadline': deadline?.toIso8601String().substring(0, 10),
      'status': status,
      'color': color,
    };
  }
}
