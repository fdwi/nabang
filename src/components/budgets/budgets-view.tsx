"use client";

import { deleteBudget } from "@/actions/budgets";
import { BudgetFormModal } from "@/components/budgets/budget-form-modal";
import { Button } from "@/components/ui/button";
import type { BudgetUsage } from "@/lib/finance/goal-calculations";
import { formatRupiah } from "@/lib/formatters/currency";
import type { Database } from "@/types/database";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Budget = Database["public"]["Tables"]["budgets"]["Row"];

export type BudgetWithUsage = Budget & {
  categoryName: string;
  usage: BudgetUsage;
};

type BudgetsViewProps = {
  allBudgets: BudgetWithUsage[];
  categories: Category[];
  initialMonth: string; // 'YYYY-MM'
};

export function BudgetsView({
  allBudgets,
  categories,
  initialMonth,
}: BudgetsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter anggaran untuk bulan yang dipilih
  const currentMonthBudgets = useMemo(() => {
    return allBudgets.filter((b) => b.month.slice(0, 7) === selectedMonth);
  }, [allBudgets, selectedMonth]);

  const totalBudgetLimit = useMemo(() => {
    return currentMonthBudgets.reduce((sum, b) => sum + Number(b.limit_amount), 0);
  }, [currentMonthBudgets]);

  const totalActualSpent = useMemo(() => {
    return currentMonthBudgets.reduce((sum, b) => sum + b.usage.actualSpent, 0);
  }, [currentMonthBudgets]);

  const hasExceeded = currentMonthBudgets.some((b) => b.usage.status === "danger");
  const hasWarning = currentMonthBudgets.some((b) => b.usage.status === "warning");

  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(newMonth);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const nextDate = new Date(y, m, 1);
    const newMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(newMonth);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Hapus batas anggaran kategori "${catName}" untuk bulan ini?`)) {
      return;
    }
    setActionError(null);
    const res = await deleteBudget(id);
    if (res?.error) {
      setActionError(res.error);
    }
  };

  const formatMonthLabel = (yyyyMm: string) => {
    const [y, m] = yyyyMm.split("-").map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-8">
      {actionError ? (
        <div
          className="rounded-2xl border border-[#963647]/30 bg-[#f9e1e1]/70 p-4 text-sm text-[#8f3242] dark:border-[#ffb9c3]/30 dark:bg-[#542d35]/70 dark:text-[#ffc4cb]"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      {/* Navigasi Pemilih Bulan & Tombol Tetapkan Anggaran */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <button
            aria-label="Bulan sebelumnya"
            className="inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#b34455]"
            onClick={handlePrevMonth}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={19} />
          </button>
          <div className="rounded-2xl border border-pink-200/80 bg-pink-50/60 px-5 py-2.5 dark:border-pink-900/40 dark:bg-pink-950/30">
            <span className="min-w-36 text-center text-sm font-bold text-foreground">
              {formatMonthLabel(selectedMonth)}
            </span>
          </div>
          <button
            aria-label="Bulan berikutnya"
            className="inline-flex size-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#b34455]"
            onClick={handleNextMonth}
            type="button"
          >
            <ChevronRight aria-hidden="true" size={19} />
          </button>
        </div>

        <Button onClick={() => setIsModalOpen(true)} type="button">
          <Plus aria-hidden="true" size={18} />
          Tetapkan Anggaran
        </Button>
      </div>

      {/* Peringatan Status Anggaran */}
      {hasExceeded ? (
        <div
          className="flex items-center gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-medium text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-200"
          role="alert"
        >
          <ShieldAlert aria-hidden="true" className="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>
            Peringatan: Ada kategori pengeluaran yang telah <strong>melebihi 100%</strong> dari batas anggaran yang Anda tetapkan.
          </span>
        </div>
      ) : hasWarning ? (
        <div
          className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-200"
          role="status"
        >
          <AlertTriangle aria-hidden="true" className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Perhatian: Pengeluaran beberapa kategori telah <strong>mencapai 80%</strong> dari batas bulanan Anda.
          </span>
        </div>
      ) : null}

      {/* Ringkasan Anggaran Bulan Terpilih ala Livin' Banner */}
      <section
        aria-labelledby="budget-summary-heading"
        className="relative overflow-hidden rounded-3xl border border-pink-200/80 bg-gradient-to-r from-pink-50 via-white to-rose-50 p-6 shadow-sm sm:p-8 dark:border-pink-900/40 dark:from-[#2d1e22] dark:via-[#211518] dark:to-[#351e24]"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase" id="budget-summary-heading">
              Total Plafon Anggaran ({formatMonthLabel(selectedMonth)})
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {formatRupiah(totalBudgetLimit)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Total batas maksimal belanja untuk seluruh pos kategori.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Pengeluaran Aktual Tercatat
            </h3>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 sm:text-4xl">
              {formatRupiah(totalActualSpent)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sisa anggaran bebas: {formatRupiah(Math.max(0, totalBudgetLimit - totalActualSpent))}
            </p>
          </div>
        </div>
      </section>

      {/* Daftar Batas Anggaran Kategori */}
      <section aria-labelledby="budget-list-heading">
        <h3 className="sr-only" id="budget-list-heading">
          Daftar Batas Anggaran Kategori
        </h3>

        {currentMonthBudgets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <PiggyBank className="mx-auto text-muted-foreground" size={36} />
            <h4 className="mt-3 text-base font-semibold">
              Belum ada anggaran untuk bulan {formatMonthLabel(selectedMonth)}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Tetapkan batas pengeluaran kategori makanan, belanja, atau tagihan agar keuangan Anda tetap terkendali.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsModalOpen(true)} type="button">
                <Plus aria-hidden="true" size={18} />
                Tetapkan Anggaran Bulan Ini
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {currentMonthBudgets.map((b) => {
              const isDanger = b.usage.status === "danger";
              const isWarning = b.usage.status === "warning";

              return (
                <div
                  className={`flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all hover:shadow-md ${
                    isDanger
                      ? "border-rose-400/80 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20"
                      : isWarning
                        ? "border-amber-400/80 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20"
                        : "border-pink-200/80 bg-gradient-to-br from-card via-card to-pink-50/50 dark:border-pink-900/30 dark:to-pink-950/20"
                  }`}
                  key={b.id}
                >
                  <div>
                    {/* Header Kategori & Status Badge */}
                    <div className="flex items-start justify-between">
                      <h4 className="text-base font-bold text-foreground">
                        {b.categoryName}
                      </h4>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isDanger
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : isWarning
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {isDanger ? "Melebihi Batas" : isWarning ? "Mendekati Batas" : "Aman"}
                      </span>
                    </div>

                    {/* Progress Bar Anggaran */}
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">
                          {b.usage.percentage}% Terpakai
                        </span>
                        <span className="text-muted-foreground">
                          Plafon: {formatRupiah(b.limit_amount)}
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDanger
                              ? "bg-rose-600 dark:bg-rose-500"
                              : isWarning
                                ? "bg-amber-500 dark:bg-amber-400"
                                : "bg-gradient-to-r from-[#be123c] to-[#fb7185]"
                          }`}
                          style={{ width: `${Math.min(b.usage.percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Rincian Pemakaian */}
                    <div className="mt-5 rounded-2xl border border-border/70 bg-background/80 p-3.5 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Realisasi Belanja:</span>
                        <span className="font-bold text-foreground">
                          {formatRupiah(b.usage.actualSpent)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sisa Alokasi:</span>
                        <span
                          className={`font-semibold ${
                            b.usage.remainingAmount < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                          }`}
                        >
                          {b.usage.remainingAmount < 0
                            ? `Defisit ${formatRupiah(Math.abs(b.usage.remainingAmount))}`
                            : formatRupiah(b.usage.remainingAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi Hapus */}
                  <div className="mt-6 flex justify-end border-t border-border/70 pt-4">
                    <button
                      aria-label={`Hapus anggaran kategori ${b.categoryName}`}
                      className="inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-[#f9e1e1] hover:text-[#963647] focus-visible:outline-2 focus-visible:outline-[#b34455] dark:hover:bg-[#542d35] dark:hover:text-[#ffc4cb]"
                      onClick={() => handleDelete(b.id, b.categoryName)}
                      title="Hapus anggaran ini"
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Form Tambah Anggaran */}
      <BudgetFormModal
        categories={categories}
        currentMonth={selectedMonth}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
