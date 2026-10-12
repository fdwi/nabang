"use client";

import { formatRupiah } from "@/lib/formatters/currency";
import { formatDateTimeIndo } from "@/lib/formatters/date";
import type { Database } from "@/types/database";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  PieChart,
  Scale,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

type Account = Database["public"]["Tables"]["accounts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

type ReportsViewProps = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
};

export function ReportsView({
  accounts,
  categories,
  transactions,
}: ReportsViewProps) {
  const [period, setPeriod] = useState<"this_month" | "last_month" | "this_year" | "all">(
    "this_month"
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a.name])), [accounts]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  // Filter transaksi
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((tx) => {
      // Filter akun
      if (
        selectedAccountId !== "all" &&
        tx.account_id !== selectedAccountId &&
        tx.destination_account_id !== selectedAccountId
      ) {
        return false;
      }

      const txDate = new Date(tx.occurred_at);

      if (period === "this_month") {
        return (
          txDate.getFullYear() === currentYear &&
          txDate.getMonth() === currentMonth
        );
      }

      if (period === "last_month") {
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        return (
          txDate.getFullYear() === lastMonthDate.getFullYear() &&
          txDate.getMonth() === lastMonthDate.getMonth()
        );
      }

      if (period === "this_year") {
        return txDate.getFullYear() === currentYear;
      }

      return true;
    });
  }, [transactions, period, selectedAccountId]);

  // Hitung agregasi: Pemasukan, Pengeluaran (Kecualikan transfer)
  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [filteredTransactions]);

  const netCashFlow = totalIncome - totalExpense;

  // Rasio Tabungan (Savings Rate) = ((Pemasukan - Pengeluaran) / Pemasukan) * 100
  const savingRate = useMemo(() => {
    if (totalIncome <= 0) return 0;
    const rate = Math.round(((totalIncome - totalExpense) / totalIncome) * 100);
    return Math.max(0, rate);
  }, [totalIncome, totalExpense]);

  // Rincian Pengeluaran per Kategori
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();

    filteredTransactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        const catName = (tx.category_id && categoryMap.get(tx.category_id)) || "Tanpa Kategori";
        map.set(catName, (map.get(catName) || 0) + (Number(tx.amount) || 0));
      });

    return Array.from(map.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categoryMap, totalExpense]);

  // Rincian Pemasukan per Kategori
  const incomeByCategory = useMemo(() => {
    const map = new Map<string, number>();

    filteredTransactions
      .filter((tx) => tx.type === "income")
      .forEach((tx) => {
        const catName = (tx.category_id && categoryMap.get(tx.category_id)) || "Tanpa Kategori";
        map.set(catName, (map.get(catName) || 0) + (Number(tx.amount) || 0));
      });

    return Array.from(map.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categoryMap, totalIncome]);

  // Ekspor CSV Laporan
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = [
      "Tanggal",
      "Jenis",
      "Nominal (Rp)",
      "Akun Sumber",
      "Akun Tujuan",
      "Kategori",
      "Catatan",
    ];

    const rows = filteredTransactions.map((tx) => [
      `"${tx.occurred_at}"`,
      tx.type,
      tx.amount,
      `"${accountMap.get(tx.account_id) || tx.account_id}"`,
      `"${tx.destination_account_id ? accountMap.get(tx.destination_account_id) || tx.destination_account_id : ""}"`,
      `"${tx.category_id ? categoryMap.get(tx.category_id) || "" : ""}"`,
      `"${(tx.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        `"Laporan Keuangan Nabang - Periode ${period}"`,
        `"Total Pemasukan","${totalIncome}"`,
        `"Total Pengeluaran","${totalExpense}"`,
        `"Arus Kas Bersih","${netCashFlow}"`,
        "",
        headers.join(","),
        ...rows.map((r) => r.join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `laporan-nabang-${period}-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header Analisis & Filter Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          {/* Pilihan Periode */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: "this_month", label: "Bulan Ini" },
              { id: "last_month", label: "Bulan Lalu" },
              { id: "this_year", label: "Tahun Ini" },
              { id: "all", label: "Semua" },
            ].map(({ id, label }) => (
              <button
                className={`min-h-10 rounded-xl px-3.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#b34455] ${
                  period === id
                    ? "bg-[#b34455] text-white dark:bg-[#ffb9c3] dark:text-[#8f3242]"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                key={id}
                onClick={() => setPeriod(id as typeof period)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Filter Akun */}
          <select
            className="min-h-10 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
            onChange={(e) => setSelectedAccountId(e.target.value)}
            value={selectedAccountId}
          >
            <option value="all">Semua Akun Rekening</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#b34455]"
          disabled={filteredTransactions.length === 0}
          onClick={handleExportCSV}
          type="button"
        >
          <Download aria-hidden="true" size={16} />
          Ekspor CSV Laporan
        </button>
      </div>

      {/* 4 Kartu Ringkasan Metrik Laporan ala Livin' Banking */}
      <section aria-label="Metrik ringkasan laporan" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-pink-200/80 bg-gradient-to-br from-card via-card to-emerald-50/40 p-5 shadow-xs dark:border-pink-900/30 dark:to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Pemasukan</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ArrowDownLeft aria-hidden="true" size={18} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {formatRupiah(totalIncome)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Arus kas masuk pada periode ini</p>
        </div>

        <div className="rounded-3xl border border-pink-200/80 bg-gradient-to-br from-card via-card to-rose-50/40 p-5 shadow-xs dark:border-pink-900/30 dark:to-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Pengeluaran</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              <ArrowUpRight aria-hidden="true" size={18} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {formatRupiah(totalExpense)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Arus kas keluar pada periode ini</p>
        </div>

        <div className="rounded-3xl border border-pink-200/80 bg-gradient-to-br from-card via-card to-pink-50/40 p-5 shadow-xs dark:border-pink-900/30 dark:to-pink-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Arus Kas Bersih</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Scale aria-hidden="true" size={18} />
            </div>
          </div>
          <p
            className={`mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl ${
              netCashFlow >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatRupiah(netCashFlow)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Selisih pemasukan dan belanja</p>
        </div>

        <div className="rounded-3xl border border-pink-200/80 bg-gradient-to-br from-card via-card to-purple-50/40 p-5 shadow-xs dark:border-pink-900/30 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rasio Tabungan</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              <TrendingUp aria-hidden="true" size={18} />
            </div>
          </div>
          <p className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {savingRate}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Persentase surplus dana tersimpan</p>
        </div>
      </section>

      {/* Grid: Rincian Pengeluaran & Pemasukan per Kategori */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pengeluaran per Kategori */}
        <section aria-labelledby="expense-cat-heading" className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground" id="expense-cat-heading">
              Distribusi Pengeluaran
            </h3>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              {expenseByCategory.length} pos
            </span>
          </div>

          {expenseByCategory.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <PieChart aria-hidden="true" size={32} />
              <p className="mt-2 text-xs sm:text-sm">Tidak ada catatan pengeluaran pada periode ini.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {expenseByCategory.map((item) => (
                <div className="space-y-1.5" key={item.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        {formatRupiah(item.amount)}
                      </span>
                      <span className="w-8 text-right font-medium text-muted-foreground">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#be123c] to-[#fb7185]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pemasukan per Kategori */}
        <section aria-labelledby="income-cat-heading" className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground" id="income-cat-heading">
              Distribusi Pemasukan
            </h3>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {incomeByCategory.length} pos
            </span>
          </div>

          {incomeByCategory.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <PieChart aria-hidden="true" size={32} />
              <p className="mt-2 text-xs sm:text-sm">Tidak ada catatan pemasukan pada periode ini.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {incomeByCategory.map((item) => (
                <div className="space-y-1.5" key={item.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        {formatRupiah(item.amount)}
                      </span>
                      <span className="w-8 text-right font-medium text-muted-foreground">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Rincian Riwayat Mutasi Laporan */}
      <section aria-labelledby="report-tx-heading" className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
        <div className="border-b border-border bg-muted/30 p-5 sm:p-6">
          <h3 className="text-base font-bold text-foreground" id="report-tx-heading">
            Daftar Rincian Mutasi Periode Ini
          </h3>
          <p className="text-xs text-muted-foreground">
            Daftar lengkap seluruh transaksi masuk, keluar, dan transfer dalam periode yang dipilih.
          </p>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground sm:text-sm">
            Tidak ada transaksi pada periode ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 sm:px-6">Waktu</th>
                  <th className="px-5 py-3.5 sm:px-6">Deskripsi & Akun</th>
                  <th className="px-5 py-3.5 sm:px-6">Kategori</th>
                  <th className="px-5 py-3.5 text-right sm:px-6">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  const isExpense = tx.type === "expense";
                  const isTransfer = tx.type === "transfer";

                  return (
                    <tr className="transition-colors hover:bg-muted/30" key={tx.id}>
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-muted-foreground sm:px-6">
                        {formatDateTimeIndo(tx.occurred_at)}
                      </td>
                      <td className="px-5 py-4 sm:px-6">
                        <p className="font-semibold text-foreground">
                          {tx.description ||
                            (isTransfer
                              ? "Pemindahan Saldo"
                              : isIncome
                                ? "Pemasukan"
                                : "Pengeluaran")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {accountMap.get(tx.account_id) || "Akun"}
                          {isTransfer && tx.destination_account_id
                            ? ` -> ${accountMap.get(tx.destination_account_id)}`
                            : ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 sm:px-6 text-xs">
                        {isTransfer ? (
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            Transfer
                          </span>
                        ) : tx.category_id ? (
                          <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-foreground">
                            {categoryMap.get(tx.category_id) || "Kategori"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Tanpa kategori</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap font-bold sm:px-6">
                        <span
                          className={
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isExpense
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-blue-600 dark:text-blue-400"
                          }
                        >
                          {isIncome ? "+" : isExpense ? "-" : ""}
                          {formatRupiah(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
