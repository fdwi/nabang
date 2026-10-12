class CategoryModel {
  final String id;
  final String name;
  final String type; // income, expense
  final String? color;
  final String? icon;
  final bool isArchived;

  CategoryModel({
    required this.id,
    required this.name,
    required this.type,
    this.color,
    this.icon,
    required this.isArchived,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String? ?? 'expense',
      color: json['color'] as String?,
      icon: json['icon'] as String?,
      isArchived: json['is_archived'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'type': type,
      'color': color,
      'icon': icon,
      'is_archived': isArchived,
    };
  }
}
