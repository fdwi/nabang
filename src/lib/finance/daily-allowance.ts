import type { Database } from "@/types/database";

type Transaction = Pick<
  Database["public"]["Tables"]["transactions"]["Row"],
  "amount" | "type" | "occurred_at"
>;

export type DailyAllowanceOptions = {
  transactions: Transaction[];
  totalBalance: number;
  monthlyBudget?: number | null; // Jika ada anggaran bulanan yang ditentukan
  paydayDay?: number; // Hari gajian / reset bulanan (default: 1)
  currentDate?: Date; // Untuk pengujian / override tanggal
};

export type DailyAllowanceResult = {
  dailyAllowance: number; // Jatah harian dasar hari ini
  todayExpense: number; // Pengeluaran hari ini
  remainingToday: number; // Sisa jatah hari ini (bisa negatif jika over budget)
  availablePool: number; // Pool dana tersisa untuk sisa hari di bulan ini
  daysRemaining: number; // Jumlah hari tersisa termasuk hari ini
  percentageUsed: number; // Persentase jatah yang sudah terpakai hari ini (0 - 100)
  status: "safe" | "warning" | "over";
  message: string;
};

/**
 * Menghitung sisa hari dari tanggal saat ini hingga tanggal reset (akhir bulan atau tanggal gajian).
 */
export function calculateDaysRemaining(
  currentDate: Date = new Date(),
  paydayDay: number = 1
): number {
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Jika reset pada tanggal 1 setiap bulan (siklus kalender normal)
  if (paydayDay <= 1) {
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    return Math.max(1, totalDaysInMonth - currentDay + 1);
  }

  // Jika reset pada tanggal gajian tertentu (misal tgl 25)
  if (currentDay < paydayDay) {
    return Math.max(1, paydayDay - currentDay + 1);
  } else {
    // Sudah melewati tanggal gajian bulan ini, hitung hari sampai tanggal gajian bulan depan
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysUntilEndOfMonth = totalDaysInMonth - currentDay;
    return Math.max(1, daysUntilEndOfMonth + paydayDay);
  }
}

/**
 * Menghitung jatah jajan harian aman (Safe-to-Spend Daily Allowance).
 */
export function calculateDailyAllowance({
  transactions,
  totalBalance,
  monthlyBudget = null,
  paydayDay = 1,
  currentDate = new Date(),
}: DailyAllowanceOptions): DailyAllowanceResult {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  // 1. Hitung pengeluaran khusus hari ini
  const todayExpense = transactions
    .filter((tx) => {
      if (tx.type !== "expense") return false;
      const d = new Date(tx.occurred_at);
      return (
        d.getFullYear() === currentYear &&
        d.getMonth() === currentMonth &&
        d.getDate() === currentDay
      );
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  // 2. Hitung jumlah hari tersisa dalam siklus
  const daysRemaining = calculateDaysRemaining(currentDate, paydayDay);

  // 3. Tentukan pool dana yang tersedia untuk dibagi
  let availablePool = 0;

  if (monthlyBudget && monthlyBudget > 0) {
    // Mode A: Berdasarkan anggaran bulanan
    // Ambil semua pengeluaran bulan ini sebelum hari ini
    const priorExpensesThisMonth = transactions
      .filter((tx) => {
        if (tx.type !== "expense") return false;
        const d = new Date(tx.occurred_at);
        const isThisMonth =
          d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        const isBeforeToday = d.getDate() < currentDay;
        return isThisMonth && isBeforeToday;
      })
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    availablePool = Math.max(0, monthlyBudget - priorExpensesThisMonth);
  } else {
    // Mode B: Berdasarkan total saldo akun aktif
    // Saldo sebelum pengeluaran hari ini terjadi
    const balanceBeforeToday = Math.max(0, totalBalance + todayExpense);
    availablePool = balanceBeforeToday;
  }

  // 4. Hitung jatah harian dasar
  const dailyAllowance = Math.max(
    0,
    Math.floor(availablePool / Math.max(1, daysRemaining))
  );

  // 5. Hitung sisa jatah hari ini
  const remainingToday = dailyAllowance - todayExpense;

  // 6. Hitung persentase terpakai
  const percentageUsed =
    dailyAllowance > 0
      ? Math.min(100, Math.round((todayExpense / dailyAllowance) * 100))
      : todayExpense > 0
      ? 100
      : 0;

  // 7. Tentukan status & pesan humanis
  let status: "safe" | "warning" | "over" = "safe";
  let message = "";

  if (remainingToday < 0) {
    status = "over";
    message = `Hari ini melebihi jatah harian sebesar ${Math.abs(
      remainingToday
    ).toLocaleString("id-ID")}. Jatah besok akan otomatis menyesuaikan agar tetap aman!`;
  } else if (percentageUsed >= 80) {
    status = "warning";
    message = `Jatah jajan hari ini hampir habis. Hemat sedikit lagi untuk malam ini ya!`;
  } else {
    status = "safe";
    message = `Pengeluaranmu hari ini terkontrol dengan baik. Sisa uang jajanmu masih aman!`;
  }

  return {
    dailyAllowance,
    todayExpense,
    remainingToday,
    availablePool,
    daysRemaining,
    percentageUsed,
    status,
    message,
  };
}
