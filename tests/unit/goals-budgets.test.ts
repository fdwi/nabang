import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateBudgetUsage,
  calculateGoalProgress,
} from "../../src/lib/finance/goal-calculations.ts";

test("calculateGoalProgress: saldo awal ditambah setoran dan dikurangi penarikan", () => {
  const goal = { initial_amount: 500000, target_amount: 2000000 };
  const contributions = [
    { amount: 500000, contribution_type: "deposit" as const },
    { amount: 200000, contribution_type: "withdrawal" as const },
  ];

  const progress = calculateGoalProgress(goal, contributions);
  assert.equal(progress.currentAmount, 800000);
  assert.equal(progress.percentage, 40);
  assert.equal(progress.remainingAmount, 1200000);
  assert.equal(progress.isCompleted, false);
});

test("calculateGoalProgress: persentase maksimum 100% dan sisa tidak negatif jika melebihi target", () => {
  const goal = { initial_amount: 1000000, target_amount: 1000000 };
  const contributions = [
    { amount: 500000, contribution_type: "deposit" as const },
  ];

  const progress = calculateGoalProgress(goal, contributions);
  assert.equal(progress.currentAmount, 1500000);
  assert.equal(progress.percentage, 100);
  assert.equal(progress.remainingAmount, 0);
  assert.equal(progress.excessAmount, 500000);
  assert.equal(progress.isCompleted, true);
});

test("calculateBudgetUsage: hanya menghitung pengeluaran kategori pada bulan yang bersangkutan", () => {
  const budget = {
    category_id: "cat-makanan",
    limit_amount: 1000000,
    month: "2026-10-01",
  };

  const transactions = [
    // Pengeluaran bulan ini (dihitung)
    { amount: 300000, category_id: "cat-makanan", occurred_at: "2026-10-05T12:00:00Z", type: "expense" as const },
    { amount: 200000, category_id: "cat-makanan", occurred_at: "2026-10-10T12:00:00Z", type: "expense" as const },
    // Transfer (TIDAK dihitung)
    { amount: 500000, category_id: null, occurred_at: "2026-10-12T12:00:00Z", type: "transfer" as const },
    // Kategori lain (TIDAK dihitung)
    { amount: 150000, category_id: "cat-transport", occurred_at: "2026-10-15T12:00:00Z", type: "expense" as const },
    // Bulan lain (TIDAK dihitung)
    { amount: 400000, category_id: "cat-makanan", occurred_at: "2026-09-25T12:00:00Z", type: "expense" as const },
  ];

  const usage = calculateBudgetUsage(budget, transactions);
  assert.equal(usage.actualSpent, 500000);
  assert.equal(usage.remainingAmount, 500000);
  assert.equal(usage.percentage, 50);
  assert.equal(usage.status, "safe");
});

test("calculateBudgetUsage: status warning pada 80% dan danger pada >= 100%", () => {
  const budget = {
    category_id: "cat-makanan",
    limit_amount: 1000000,
    month: "2026-10-01",
  };

  // 85% pengeluaran -> warning
  const txWarning = [
    { amount: 850000, category_id: "cat-makanan", occurred_at: "2026-10-05T12:00:00Z", type: "expense" as const },
  ];
  assert.equal(calculateBudgetUsage(budget, txWarning).status, "warning");

  // 105% pengeluaran -> danger
  const txDanger = [
    { amount: 1050000, category_id: "cat-makanan", occurred_at: "2026-10-05T12:00:00Z", type: "expense" as const },
  ];
  assert.equal(calculateBudgetUsage(budget, txDanger).status, "danger");
});
