import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAccountBalance,
  calculateCashFlow,
  calculatePeriodExpense,
  calculatePeriodIncome,
  calculateTotalBalance,
} from "../../src/lib/finance/calculations.ts";

test("calculateAccountBalance: saldo awal ditambah pemasukan", () => {
  const account = { id: "acc-1", opening_balance: 100000 };
  const transactions = [
    { account_id: "acc-1", destination_account_id: null, amount: 50000, type: "income" as const },
  ];

  const balance = calculateAccountBalance(account, transactions);
  assert.equal(balance, 150000);
});

test("calculateAccountBalance: saldo dikurangi pengeluaran", () => {
  const account = { id: "acc-1", opening_balance: 100000 };
  const transactions = [
    { account_id: "acc-1", destination_account_id: null, amount: 30000, type: "expense" as const },
  ];

  const balance = calculateAccountBalance(account, transactions);
  assert.equal(balance, 70000);
});

test("calculateAccountBalance: transfer keluar mengurangi akun sumber", () => {
  const account = { id: "acc-1", opening_balance: 100000 };
  const transactions = [
    { account_id: "acc-1", destination_account_id: "acc-2", amount: 40000, type: "transfer" as const },
  ];

  const balance = calculateAccountBalance(account, transactions);
  assert.equal(balance, 60000);
});

test("calculateAccountBalance: transfer masuk menambah akun tujuan", () => {
  const account = { id: "acc-2", opening_balance: 50000 };
  const transactions = [
    { account_id: "acc-1", destination_account_id: "acc-2", amount: 40000, type: "transfer" as const },
  ];

  const balance = calculateAccountBalance(account, transactions);
  assert.equal(balance, 90000);
});

test("calculateTotalBalance: transfer antar-akun tidak mengubah saldo gabungan", () => {
  const accounts = [
    { id: "acc-1", opening_balance: 100000, is_active: true },
    { id: "acc-2", opening_balance: 50000, is_active: true },
  ];
  const transactions = [
    { account_id: "acc-1", destination_account_id: "acc-2", amount: 25000, type: "transfer" as const },
  ];

  const total = calculateTotalBalance(accounts, transactions);
  assert.equal(total, 150000); // 75000 + 75000 = 150000
});

test("calculateTotalBalance: akun nonaktif tidak dihitung dalam saldo gabungan", () => {
  const accounts = [
    { id: "acc-1", opening_balance: 100000, is_active: true },
    { id: "acc-2", opening_balance: 50000, is_active: false },
  ];
  const transactions = [
    { account_id: "acc-1", destination_account_id: null, amount: 20000, type: "income" as const },
  ];

  const total = calculateTotalBalance(accounts, transactions);
  assert.equal(total, 120000); // Hanya acc-1
});

test("calculatePeriodIncome, calculatePeriodExpense, calculateCashFlow", () => {
  const transactions = [
    { account_id: "acc-1", destination_account_id: null, amount: 500000, type: "income" as const },
    { account_id: "acc-1", destination_account_id: null, amount: 150000, type: "expense" as const },
    { account_id: "acc-1", destination_account_id: "acc-2", amount: 100000, type: "transfer" as const },
  ];

  assert.equal(calculatePeriodIncome(transactions), 500000);
  assert.equal(calculatePeriodExpense(transactions), 150000);
  assert.equal(calculateCashFlow(transactions), 350000); // 500000 - 150000 (transfer tidak masuk cashflow)
});
