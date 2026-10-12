import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/account_model.dart';
import '../models/category_model.dart';
import '../models/transaction_model.dart';
import '../models/goal_model.dart';
import '../models/budget_model.dart';

class SupabaseService {
  static final SupabaseService instance = SupabaseService._internal();
  SupabaseService._internal();

  SupabaseClient get _client => Supabase.instance.client;

  User? get currentUser => _client.auth.currentUser;
  bool get isAuthenticated => currentUser != null;

  // ==================== AUTHENTICATION ====================

  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    return await _client.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );
  }

  Future<AuthResponse> signUp({
    required String email,
    required String password,
  }) async {
    return await _client.auth.signUp(
      email: email.trim(),
      password: password,
    );
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  // ==================== ACCOUNTS ====================

  Future<List<AccountModel>> getAccounts() async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final rawAccounts = await _client
        .from('accounts')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: true);

    final rawTxs = await _client
        .from('transactions')
        .select('account_id, destination_account_id, amount, type')
        .eq('user_id', userId);

    return (rawAccounts as List).map((accJson) {
      final accId = accJson['id'] as String;
      final opening = (accJson['opening_balance'] ?? 0) as num;
      num current = opening;

      for (final tx in (rawTxs as List)) {
        final amt = (tx['amount'] as num?) ?? 0;
        final type = tx['type'] as String;
        final srcId = tx['account_id'] as String?;
        final dstId = tx['destination_account_id'] as String?;

        if (type == 'income' && srcId == accId) {
          current += amt;
        } else if (type == 'expense' && srcId == accId) {
          current -= amt;
        } else if (type == 'transfer') {
          if (srcId == accId) current -= amt;
          if (dstId == accId) current += amt;
        }
      }

      return AccountModel.fromJson(accJson, calculatedBalance: current);
    }).toList();
  }

  Future<void> createAccount({
    required String name,
    required String accountType,
    required num openingBalance,
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Sesi tidak ditemukan.');

    await _client.from('accounts').insert({
      'user_id': userId,
      'name': name.trim(),
      'account_type': accountType,
      'opening_balance': openingBalance,
      'is_active': true,
    });
  }

  Future<void> deleteAccount(String accountId) async {
    await _client.from('accounts').delete().eq('id', accountId);
  }

  // ==================== CATEGORIES ====================

  Future<List<CategoryModel>> getCategories() async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final data = await _client
        .from('categories')
        .select()
        .eq('user_id', userId)
        .order('name', ascending: true);

    return (data as List).map((c) => CategoryModel.fromJson(c)).toList();
  }

  Future<void> createCategory({
    required String name,
    required String type,
    String? color,
    String? icon,
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Sesi tidak ditemukan.');

    await _client.from('categories').insert({
      'user_id': userId,
      'name': name.trim(),
      'type': type,
      'color': color ?? '#E11D48',
      'icon': icon ?? 'tag',
      'is_archived': false,
    });
  }

  // ==================== TRANSACTIONS ====================

  Future<List<TransactionModel>> getTransactions({int limit = 50}) async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final data = await _client
        .from('transactions')
        .select('''
          *,
          accounts:account_id(name),
          destination_account:destination_account_id(name),
          categories:category_id(name)
        ''')
        .eq('user_id', userId)
        .order('occurred_at', ascending: false)
        .limit(limit);

    return (data as List).map((t) => TransactionModel.fromJson(t)).toList();
  }

  Future<void> createTransaction({
    required String type,
    required num amount,
    required String accountId,
    String? destinationAccountId,
    String? categoryId,
    String? description,
    required DateTime occurredAt,
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Sesi tidak ditemukan.');

    await _client.from('transactions').insert({
      'user_id': userId,
      'type': type,
      'amount': amount,
      'account_id': accountId,
      'destination_account_id': type == 'transfer' ? destinationAccountId : null,
      'category_id': type != 'transfer' ? categoryId : null,
      'description': description?.trim().isEmpty == true ? null : description?.trim(),
      'occurred_at': occurredAt.toIso8601String(),
    });
  }

  Future<void> deleteTransaction(String transactionId) async {
    await _client.from('transactions').delete().eq('id', transactionId);
  }

  // ==================== GOALS ====================

  Future<List<GoalModel>> getGoals() async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final rawGoals = await _client
        .from('savings_goals')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);

    final rawContribs = await _client
        .from('goal_contributions')
        .select('goal_id, amount, contribution_type')
        .eq('user_id', userId);

    return (rawGoals as List).map((goalJson) {
      final goalId = goalJson['id'] as String;
      num sum = 0;
      for (final c in (rawContribs as List)) {
        if (c['goal_id'] == goalId) {
          final amt = (c['amount'] as num?) ?? 0;
          final cType = c['contribution_type'] as String?;
          if (cType == 'withdrawal') {
            sum -= amt;
          } else {
            sum += amt;
          }
        }
      }
      return GoalModel.fromJson(goalJson, calculatedContributions: sum);
    }).toList();
  }

  Future<void> createGoal({
    required String name,
    required num targetAmount,
    num initialAmount = 0,
    DateTime? deadline,
    String? color,
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Sesi tidak ditemukan.');

    await _client.from('savings_goals').insert({
      'user_id': userId,
      'name': name.trim(),
      'target_amount': targetAmount,
      'initial_amount': initialAmount,
      'deadline': deadline?.toIso8601String().substring(0, 10),
      'status': 'active',
      'color': color ?? '#E11D48',
    });
  }

  Future<void> addGoalContribution({
    required String goalId,
    required num amount,
    String contributionType = 'deposit',
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Sesi tidak ditemukan.');

    await _client.from('goal_contributions').insert({
      'user_id': userId,
      'goal_id': goalId,
      'amount': amount,
      'contribution_type': contributionType,
      'occurred_at': DateTime.now().toIso8601String(),
    });
  }

  // ==================== BUDGETS ====================

  Future<List<BudgetModel>> getBudgets({required String month}) async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final rawBudgets = await _client
        .from('budgets')
        .select('*, categories:category_id(name)')
        .eq('user_id', userId)
        .eq('month', month);

    final rawTxs = await _client
        .from('transactions')
        .select('category_id, amount, occurred_at')
        .eq('user_id', userId)
        .eq('type', 'expense');

    return (rawBudgets as List).map((bJson) {
      final catId = bJson['category_id'] as String;
      num spent = 0;
      for (final tx in (rawTxs as List)) {
        if (tx['category_id'] == catId) {
          final occurredAtStr = tx['occurred_at'] as String?;
          if (occurredAtStr != null && occurredAtStr.startsWith(month)) {
            spent += (tx['amount'] as num?) ?? 0;
          }
        }
      }
      return BudgetModel.fromJson(bJson, calculatedSpent: spent);
    }).toList();
  }

  Future<void> createOrUpdateBudget({
    required String categoryId,
    required String month,
    required num limitAmount,
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Sesi tidak ditemukan.');

    final existing = await _client
        .from('budgets')
        .select('id')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('month', month)
        .maybeSingle();

    if (existing != null) {
      await _client
          .from('budgets')
          .update({'limit_amount': limitAmount})
          .eq('id', existing['id']);
    } else {
      await _client.from('budgets').insert({
        'user_id': userId,
        'category_id': categoryId,
        'month': month,
        'limit_amount': limitAmount,
      });
    }
  }
}
