class DailyAllowanceResult {
  final num dailyAllowance;
  final num todayExpense;
  final num remainingToday;
  final num availablePool;
  final int daysRemaining;
  final int percentageUsed;
  final String status; // 'safe' | 'warning' | 'over'
  final String message;

  const DailyAllowanceResult({
    required this.dailyAllowance,
    required this.todayExpense,
    required this.remainingToday,
    required this.availablePool,
    required this.daysRemaining,
    required this.percentageUsed,
    required this.status,
    required this.message,
  });

  bool get isOver => status == 'over';
  bool get isWarning => status == 'warning';
  bool get isSafe => status == 'safe';
}

class DailyAllowanceService {
  static int calculateDaysRemaining(DateTime currentDate, int paydayDay) {
    final currentDay = currentDate.day;
    final currentMonth = currentDate.month;
    final currentYear = currentDate.year;

    if (paydayDay <= 1) {
      final totalDaysInMonth = DateTime(currentYear, currentMonth + 1, 0).day;
      final remaining = totalDaysInMonth - currentDay + 1;
      return remaining > 0 ? remaining : 1;
    }

    if (currentDay < paydayDay) {
      final remaining = paydayDay - currentDay + 1;
      return remaining > 0 ? remaining : 1;
    } else {
      final totalDaysInMonth = DateTime(currentYear, currentMonth + 1, 0).day;
      final daysUntilEndOfMonth = totalDaysInMonth - currentDay;
      final remaining = daysUntilEndOfMonth + paydayDay;
      return remaining > 0 ? remaining : 1;
    }
  }

  static DailyAllowanceResult calculate({
    required num todayExpense,
    required num totalBalance,
    num? monthlyBudget,
    num? customDailyAmount,
    String mode = 'balance', // 'custom' | 'balance' | 'budget'
    int paydayDay = 1,
    DateTime? currentDate,
  }) {
    final now = currentDate ?? DateTime.now();
    final daysRemaining = calculateDaysRemaining(now, paydayDay);

    num dailyAllowance = 0;
    num availablePool = 0;

    if (mode == 'custom' && customDailyAmount != null && customDailyAmount > 0) {
      dailyAllowance = customDailyAmount;
      availablePool = dailyAllowance * daysRemaining;
    } else if (mode == 'budget' && monthlyBudget != null && monthlyBudget > 0) {
      availablePool = monthlyBudget > 0 ? monthlyBudget : 0;
      dailyAllowance = daysRemaining > 0 ? (availablePool / daysRemaining).floor() : 0;
    } else {
      final balanceBeforeToday = totalBalance + todayExpense;
      availablePool = balanceBeforeToday > 0 ? balanceBeforeToday : 0;
      dailyAllowance = daysRemaining > 0 ? (availablePool / daysRemaining).floor() : 0;
    }

    final remainingToday = dailyAllowance - todayExpense;

    int percentageUsed = 0;
    if (dailyAllowance > 0) {
      percentageUsed = ((todayExpense / dailyAllowance) * 100).round();
      if (percentageUsed > 100) percentageUsed = 100;
      if (percentageUsed < 0) percentageUsed = 0;
    } else if (todayExpense > 0) {
      percentageUsed = 100;
    }

    String status = 'safe';
    String message = '';

    if (remainingToday < 0) {
      status = 'over';
      message = 'Hari ini pengeluaran melebihi jatah harian. Jatah besok akan menyesuaikan!';
    } else if (percentageUsed >= 80) {
      status = 'warning';
      message = 'Jatah jajan hari ini hampir habis. Hemat sedikit lagi ya!';
    } else {
      status = 'safe';
      message = 'Pengeluaran hari ini terkontrol dengan baik. Sisa uang jajanmu masih aman!';
    }

    return DailyAllowanceResult(
      dailyAllowance: dailyAllowance,
      todayExpense: todayExpense,
      remainingToday: remainingToday,
      availablePool: availablePool,
      daysRemaining: daysRemaining,
      percentageUsed: percentageUsed,
      status: status,
      message: message,
    );
  }
}
