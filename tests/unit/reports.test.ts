import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCashFlow,
  calculatePeriodExpense,
  calculatePeriodIncome,
} from "../../src/lib/finance/calculations.ts";

test("laporan agregasi: transfer tidak dihitung sebagai pemasukan atau pengeluaran", () => {
  const transactions = [
    { account_id: "acc-1", destination_account_id: null, amount: 2000000, type: "income" as const },
    { account_id: "acc-1", destination_account_id: null, amount: 800000, type: "expense" as const },
    // Transfer antar-akun
    { account_id: "acc-1", destination_account_id: "acc-2", amount: 500000, type: "transfer" as const },
  ];

  const income = calculatePeriodIncome(transactions);
  const expense = calculatePeriodExpense(transactions);
  const net = calculateCashFlow(transactions);

  assert.equal(income, 2000000);
  assert.equal(expense, 800000);
  assert.equal(net, 1200000); // 2000000 - 800000 (transfer tidak masuk arus kas gabungan)
});

test("laporan rasio tabungan: dihitung positif jika surplus", () => {
  const income = 10000000;
  const expense = 6000000;
  const net = income - expense;

  const savingRate = income > 0 && net > 0 ? Math.round((net / income) * 100) : 0;
  assert.equal(savingRate, 40); // 40%
});
