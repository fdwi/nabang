"use client";

import {
  calculateDailyAllowance,
  type DailyAllowanceResult,
} from "@/lib/finance/daily-allowance";
import { formatRupiah } from "@/lib/formatters/currency";
import type { Database } from "@/types/database";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

type DailyAllowanceCardProps = {
  transactions: Transaction[];
  totalBalance: number;
  monthlyBudget?: number | null;
  showBalance?: boolean;
  onOpenExpenseModal?: () => void;
};

const PAYDAY_STORAGE_KEY = "nabang_payday_day";
const MODE_STORAGE_KEY = "nabang_allowance_mode";

export function DailyAllowanceCard({
  transactions,
  totalBalance,
  monthlyBudget = null,
  showBalance = true,
  onOpenExpenseModal,
}: DailyAllowanceCardProps) {
  const [paydayDay, setPaydayDay] = useState<number>(1);
  const [mode, setMode] = useState<"balance" | "budget">("balance");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load preferences dari localStorage
  useEffect(() => {
    try {
      const savedPayday = localStorage.getItem(PAYDAY_STORAGE_KEY);
      if (savedPayday) {
        const parsed = parseInt(savedPayday, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 31) {
          setPaydayDay(parsed);
        }
      }

      const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
      if (savedMode === "budget" || savedMode === "balance") {
        setMode(savedMode);
      } else if (monthlyBudget && monthlyBudget > 0) {
        setMode("budget");
      }
    } catch {
      /* noop */
    }
  }, [monthlyBudget]);

  const saveSettings = (newPayday: number, newMode: "balance" | "budget") => {
    setPaydayDay(newPayday);
    setMode(newMode);
    try {
      localStorage.setItem(PAYDAY_STORAGE_KEY, String(newPayday));
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
    } catch {
      /* noop */
    }
    setIsSettingsOpen(false);
  };

  // Hitung daily allowance
  const allowance: DailyAllowanceResult = useMemo(() => {
    return calculateDailyAllowance({
      transactions,
      totalBalance,
      monthlyBudget: mode === "budget" ? monthlyBudget : null,
      paydayDay,
      currentDate: new Date(),
    });
  }, [transactions, totalBalance, monthlyBudget, mode, paydayDay]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-pink-200/80 bg-gradient-to-br from-card via-card to-pink-50/40 p-6 shadow-sm transition-all sm:p-7 dark:border-pink-900/40 dark:to-pink-950/20">
      {/* Header Widget */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-11 items-center justify-center rounded-2xl shadow-xs ${
              allowance.status === "over"
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300"
                : allowance.status === "warning"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
            }`}
          >
            {allowance.status === "over" ? (
              <ShieldAlert aria-hidden="true" size={22} />
            ) : allowance.status === "warning" ? (
              <AlertTriangle aria-hidden="true" size={22} />
            ) : (
              <ShieldCheck aria-hidden="true" size={22} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground sm:text-lg">
                Jatah Jajan Hari Ini
              </h2>
              <span className="rounded-full bg-pink-100/90 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#8f3242] uppercase dark:bg-pink-950/80 dark:text-[#ffc4cb]">
                Safe-to-Spend
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Hitungan aman agar uangmu tidak habis sebelum akhir bulan.
            </p>
          </div>
        </div>

        {/* Tombol Pengaturan Siklus */}
        <button
          aria-label="Pengaturan jatah jajan"
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455] sm:self-auto"
          onClick={() => setIsSettingsOpen(true)}
          type="button"
        >
          <Settings2 size={14} />
          <span>Atur Siklus</span>
        </button>
      </div>

      {/* Bagian Utama: Nominal Sisa Jatah Hari Ini & Status */}
      <div className="mt-6 rounded-2xl border border-border/80 bg-background/80 p-5 shadow-xs backdrop-blur-xs">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Sisa Jatah Jajan Hari Ini
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <p
                className={`text-3xl font-black tracking-tight sm:text-4xl ${
                  allowance.status === "over"
                    ? "text-rose-600 dark:text-rose-400"
                    : allowance.status === "warning"
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {showBalance
                  ? formatRupiah(allowance.remainingToday)
                  : "Rp ••••••••••"}
              </p>
              {allowance.status === "over" && (
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  (Over Budget)
                </span>
              )}
            </div>
          </div>

          {/* Badge Status Indikator */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              allowance.status === "over"
                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200"
                : allowance.status === "warning"
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200"
            }`}
          >
            {allowance.status === "over" ? (
              <>
                <ShieldAlert size={14} />
                <span>Melebihi Jatah Harian</span>
              </>
            ) : allowance.status === "warning" ? (
              <>
                <Clock size={14} />
                <span>Mulai Menipis</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Aman Digunakan</span>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar Persentase Terpakai Hari Ini */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Terpakai Hari Ini:{" "}
              <strong className="text-foreground">
                {showBalance
                  ? formatRupiah(allowance.todayExpense)
                  : "••••••••"}
              </strong>
            </span>
            <span className="font-semibold">{allowance.percentageUsed}%</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                allowance.status === "over"
                  ? "bg-rose-600 dark:bg-rose-500"
                  : allowance.status === "warning"
                  ? "bg-amber-500"
                  : "bg-emerald-600 dark:bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, allowance.percentageUsed)}%` }}
            />
          </div>
        </div>

        {/* Pesan Ramah / Humanis */}
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {allowance.message}
        </p>
      </div>

      {/* 3 Metrik Detail Bawah */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Jatah Dasar Awal Hari */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center sm:text-left">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
            <Coins size={14} />
            <span>Jatah Awal Hari Ini</span>
          </div>
          <p className="mt-1 text-base font-bold text-foreground">
            {showBalance
              ? formatRupiah(allowance.dailyAllowance)
              : "••••••••"}
          </p>
        </div>

        {/* Pengeluaran Hari Ini */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center sm:text-left">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
            <TrendingDown size={14} />
            <span>Belanja Hari Ini</span>
          </div>
          <p className="mt-1 text-base font-bold text-foreground">
            {showBalance
              ? formatRupiah(allowance.todayExpense)
              : "••••••••"}
          </p>
        </div>

        {/* Sisa Hari Dalam Siklus */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center sm:text-left">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
            <Calendar size={14} />
            <span>Sisa Hari di Siklus</span>
          </div>
          <p className="mt-1 text-base font-bold text-foreground">
            {allowance.daysRemaining}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              hari lagi
            </span>
          </p>
        </div>
      </div>

      {/* Tombol Akselerasi / Pintasan */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5 pt-1">
        {onOpenExpenseModal && (
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#b34455] px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#963647] focus-visible:outline-2 focus-visible:outline-[#b34455]"
            onClick={onOpenExpenseModal}
            type="button"
          >
            <span>+ Catat Pengeluaran Hari Ini</span>
          </button>
        )}
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-pink-300/70 bg-pink-50/70 px-4 text-xs font-semibold text-[#8f3242] transition-colors hover:bg-pink-100/80 focus-visible:outline-2 focus-visible:outline-[#b34455] dark:border-pink-900/50 dark:bg-pink-950/40 dark:text-[#ffc4cb]"
          href="/warung"
        >
          <UtensilsCrossed className="mr-1.5 size-4" />
          <span>Jajan di Warung</span>
        </Link>
      </div>

      {/* Modal Pengaturan Siklus & Mode Jatah Harian */}
      {isSettingsOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
        >
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="text-[#b34455] dark:text-[#ffb9c3]" size={18} />
                <h3 className="text-base font-bold text-foreground">
                  Atur Jatah Jajan Harian
                </h3>
              </div>
              <button
                aria-label="Tutup pengaturan"
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                onClick={() => setIsSettingsOpen(false)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const fd = new FormData(form);
                const payday = parseInt(fd.get("payday") as string, 10) || 1;
                const chosenMode = (fd.get("mode") as "balance" | "budget") || "balance";
                saveSettings(payday, chosenMode);
              }}
            >
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Dasar Perhitungan Dana
                </label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pilih sumber dana yang akan dibagi ke sisa hari:
                </p>
                <div className="mt-2 space-y-2">
                  <label className="flex items-start gap-2.5 rounded-xl border border-border p-2.5 cursor-pointer hover:bg-muted/30">
                    <input
                      defaultChecked={mode === "balance"}
                      name="mode"
                      type="radio"
                      value="balance"
                      className="mt-0.5 size-4 text-[#b34455]"
                    />
                    <div>
                      <span className="text-xs font-semibold text-foreground">
                        Total Saldo Akun Aktif
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Jatah harian langsung dihitung dari sisa saldo semua rekening/dompet aktifmu.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 rounded-xl border border-border p-2.5 cursor-pointer hover:bg-muted/30">
                    <input
                      defaultChecked={mode === "budget"}
                      name="mode"
                      type="radio"
                      value="budget"
                      className="mt-0.5 size-4 text-[#b34455]"
                    />
                    <div>
                      <span className="text-xs font-semibold text-foreground">
                        Anggaran Bulanan ({monthlyBudget ? formatRupiah(monthlyBudget) : "Belum diatur"})
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Jatah dihitung dari sisa batas anggaran bulanan yang kamu tetapkan di menu Anggaran.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Tanggal Reset Siklus / Gajian
                </label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pilih tanggal berapa siklus keuanganmu di-reset (default: tanggal 1):
                </p>
                <select
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-[#b34455] focus:outline-none"
                  defaultValue={paydayDay}
                  name="payday"
                >
                  <option value={1}>Tanggal 1 (Awal Bulan Kalender)</option>
                  <option value={25}>Tanggal 25 (Gajian Payroll)</option>
                  <option value={28}>Tanggal 28 (Akhir Bulan Kerja)</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1)
                    .filter((d) => ![1, 25, 28].includes(d))
                    .map((d) => (
                      <option key={d} value={d}>
                        Tanggal {d}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  onClick={() => setIsSettingsOpen(false)}
                  type="button"
                >
                  Batal
                </button>
                <button
                  className="rounded-xl bg-[#b34455] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#963647]"
                  type="submit"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
