import type { Database } from "@/types/database";

type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"];
type GoalContribution = Database["public"]["Tables"]["goal_contributions"]["Row"];
type Budget = Database["public"]["Tables"]["budgets"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export type GoalProgress = {
  currentAmount: number;
  excessAmount: number;
  isCompleted: boolean;
  percentage: number;
  remainingAmount: number;
};

export function calculateGoalProgress(
  goal: Pick<SavingsGoal, "initial_amount" | "target_amount">,
  contributions: Pick<GoalContribution, "amount" | "contribution_type">[]
): GoalProgress {
  let currentAmount = Number(goal.initial_amount) || 0;

  for (const c of contributions) {
    const amt = Number(c.amount) || 0;
    if (c.contribution_type === "deposit") {
      currentAmount += amt;
    } else if (c.contribution_type === "withdrawal") {
      currentAmount -= amt;
    }
  }

  const targetAmount = Number(goal.target_amount) || 1;
  const rawPercentage = (currentAmount / targetAmount) * 100;
  const percentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const excessAmount = Math.max(0, currentAmount - targetAmount);
  const isCompleted = currentAmount >= targetAmount;

  return {
    currentAmount,
    excessAmount,
    isCompleted,
    percentage,
    remainingAmount,
  };
}

export type BudgetUsage = {
  actualSpent: number;
  limitAmount: number;
  percentage: number;
  remainingAmount: number;
  status: "danger" | "safe" | "warning";
};

export function calculateBudgetUsage(
  budget: Pick<Budget, "limit_amount" | "month" | "category_id">,
  transactions: Pick<Transaction, "amount" | "category_id" | "occurred_at" | "type">[]
): BudgetUsage {
  const budgetMonth = budget.month.slice(0, 7); // 'YYYY-MM'
  const limitAmount = Number(budget.limit_amount) || 0;

  // Hanya hitung transaksi bertipe 'expense' pada kategori dan bulan yang sama (transfer tidak dihitung)
  const actualSpent = transactions
    .filter((tx) => {
      if (tx.type !== "expense") return false;
      if (tx.category_id !== budget.category_id) return false;
      const txMonth = tx.occurred_at.slice(0, 7);
      return txMonth === budgetMonth;
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  const remainingAmount = limitAmount - actualSpent;
  const rawPercentage = limitAmount > 0 ? (actualSpent / limitAmount) * 100 : 0;
  const percentage = Math.round(rawPercentage);

  let status: "danger" | "safe" | "warning" = "safe";
  if (percentage >= 100) {
    status = "danger";
  } else if (percentage >= 80) {
    status = "warning";
  }

  return {
    actualSpent,
    limitAmount,
    percentage,
    remainingAmount,
    status,
  };
}
