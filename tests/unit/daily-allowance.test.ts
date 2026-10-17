import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateDaysRemaining,
  calculateDailyAllowance,
} from "../../src/lib/finance/daily-allowance.ts";

test("calculateDaysRemaining: menghitung sisa hari kalender dengan benar", () => {
  // 18 Oktober (Oktober memiliki 31 hari): 31 - 18 + 1 = 14 hari tersisa
  const oct18 = new Date(2026, 9, 18);
  assert.equal(calculateDaysRemaining(oct18, 1), 14);

  // 31 Oktober: hari terakhir = 1 hari tersisa
  const oct31 = new Date(2026, 9, 31);
  assert.equal(calculateDaysRemaining(oct31, 1), 1);
});

test("calculateDaysRemaining: menghitung sisa hari berdasarkan tanggal gajian kustom", () => {
  // Hari ini tgl 18, gajian tgl 25: 25 - 18 + 1 = 8 hari tersisa
  const oct18 = new Date(2026, 9, 18);
  assert.equal(calculateDaysRemaining(oct18, 25), 8);
});

test("calculateDailyAllowance: membagi saldo aktif dengan sisa hari secara merata", () => {
  const currentDate = new Date(2026, 9, 18); // 14 hari tersisa di Oktober
  const transactions = [
    {
      amount: 15000,
      type: "expense" as const,
      occurred_at: new Date(2026, 9, 18, 12, 0).toISOString(),
    },
  ];

  // Saldo saat ini 685.000 (sebelum belanja 15.000 saldo adalah 700.000)
  // Jatah harian = 700.000 / 14 = 50.000
  // Sisa jatah hari ini = 50.000 - 15.000 = 35.000
  const result = calculateDailyAllowance({
    transactions,
    totalBalance: 685000,
    currentDate,
  });

  assert.equal(result.daysRemaining, 14);
  assert.equal(result.todayExpense, 15000);
  assert.equal(result.dailyAllowance, 50000);
  assert.equal(result.remainingToday, 35000);
  assert.equal(result.status, "safe");
  assert.equal(result.percentageUsed, 30);
});

test("calculateDailyAllowance: status over jika belanja hari ini melebihi jatah harian", () => {
  const currentDate = new Date(2026, 9, 18); // 14 hari tersisa
  const transactions = [
    {
      amount: 70000,
      type: "expense" as const,
      occurred_at: new Date(2026, 9, 18, 13, 0).toISOString(),
    },
  ];

  // Saldo saat ini 630.000 (sebelum belanja 70.000 saldo adalah 700.000)
  // Jatah harian = 700.000 / 14 = 50.000
  // Belanja hari ini 70.000 -> sisa -20.000 (over budget)
  const result = calculateDailyAllowance({
    transactions,
    totalBalance: 630000,
    currentDate,
  });

  assert.equal(result.dailyAllowance, 50000);
  assert.equal(result.todayExpense, 70000);
  assert.equal(result.remainingToday, -20000);
  assert.equal(result.status, "over");
  assert.equal(result.percentageUsed, 100);
});
