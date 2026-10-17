"use client";

import { deleteTransaction } from "@/actions/transactions";
import { TransactionFormModal } from "@/components/transactions/transaction-form-modal";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/formatters/currency";
import { formatDateTimeIndo } from "@/lib/formatters/date";
import type { Database } from "@/types/database";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Download,
  Plus,
  ReceiptText,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

type Account = Database["public"]["Tables"]["accounts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

type TransactionsViewProps = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
};

export function TransactionsView({
  accounts,
  categories,
  transactions,
}: TransactionsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"income" | "expense" | "transfer">("expense");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "last_7_days" | "this_month">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [actionError, setActionError] = useState<string | null>(null);

  const accountMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a.name]));
  }, [accounts]);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  // Filter logika
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter tanggal / periode
      if (dateFilter !== "all") {
        const txDate = new Date(tx.occurred_at);
        const now = new Date();
        const cy = now.getFullYear();
        const cm = now.getMonth();
        const cd = now.getDate();

        if (dateFilter === "today") {
          if (
            txDate.getFullYear() !== cy ||
            txDate.getMonth() !== cm ||
            txDate.getDate() !== cd
          ) {
            return false;
          }
        } else if (dateFilter === "last_7_days") {
          const sevenDaysAgo = new Date(cy, cm, cd - 6, 0, 0, 0, 0);
          if (txDate < sevenDaysAgo) return false;
        } else if (dateFilter === "this_month") {
          if (txDate.getFullYear() !== cy || txDate.getMonth() !== cm) {
            return false;
          }
        }
      }

      // Filter tipe
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      // Filter akun
      if (
        accountFilter !== "all" &&
        tx.account_id !== accountFilter &&
        tx.destination_account_id !== accountFilter
      ) {
        return false;
      }

      // Filter kategori
      if (categoryFilter !== "all" && tx.category_id !== categoryFilter) {
        return false;
      }

      // Filter pencarian
      if (search.trim()) {
        const query = search.toLowerCase();
        const descMatch = (tx.description || "").toLowerCase().includes(query);
        const accMatch = (accountMap.get(tx.account_id) || "")
          .toLowerCase()
          .includes(query);
        const catMatch = (categoryMap.get(tx.category_id || "") || "")
          .toLowerCase()
          .includes(query);
        return descMatch || accMatch || catMatch;
      }

      return true;
    });
  }, [transactions, dateFilter, typeFilter, accountFilter, categoryFilter, search, accountMap, categoryMap]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan transaksi ini? Saldo akun terkait akan disesuaikan otomatis.")) {
      return;
    }
    setActionError(null);
    const res = await deleteTransaction(id);
    if (res?.error) {
      setActionError(res.error);
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ["ID", "Waktu", "Tipe", "Nominal", "Akun Sumber", "Akun Tujuan", "Kategori", "Catatan"];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      new Date(tx.occurred_at).toLocaleString("id-ID"),
      tx.type,
      tx.amount,
      `"${accountMap.get(tx.account_id) || ""}"`,
      `"${tx.destination_account_id ? accountMap.get(tx.destination_account_id) || "" : ""}"`,
      `"${tx.category_id ? categoryMap.get(tx.category_id) || "" : ""}"`,
      `"${(tx.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nabang_mutasi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openModalWithType = (type: "income" | "expense" | "transfer") => {
    setModalType(type);
    setIsModalOpen(true);
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

      {/* Header Mutasi Rekening ala Livin' Banking */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Mutasi Transaksi
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Total {filteredTransactions.length} mutasi ditemukan pada filter saat ini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#b34455]"
            disabled={filteredTransactions.length === 0}
            onClick={handleExportCSV}
            type="button"
          >
            <Download aria-hidden="true" size={16} />
            Ekspor CSV
          </button>
          <Button onClick={() => openModalWithType("expense")} type="button">
            <Plus aria-hidden="true" size={18} />
            Catat Mutasi
          </Button>
        </div>
      </div>

      {/* Filter Bar ala Livin' Pills */}
      <section aria-label="Filter mutasi transaksi" className="space-y-4 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        {/* Quick Date Pills: Semua, Hari Ini, 7 Hari, Bulan Ini */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Periode:</span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: "all", label: "Semua Waktu" },
              { id: "today", label: "Hari Ini" },
              { id: "last_7_days", label: "7 Hari Terakhir" },
              { id: "this_month", label: "Bulan Ini" },
            ].map(({ id, label }) => (
              <button
                className={`min-h-9 rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#b34455] ${
                  dateFilter === id
                    ? "bg-[#b34455] text-white dark:bg-[#ffb9c3] dark:text-[#8f3242]"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                key={id}
                onClick={() => setDateFilter(id as typeof dateFilter)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pencarian */}
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
              size={17}
            />
            <input
              className="min-h-11 w-full rounded-xl border border-border bg-background pr-3 pl-10 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari deskripsi / akun..."
              type="text"
              value={search}
            />
          </div>

          {/* Filter Jenis Transaksi */}
          <div>
            <select
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
              onChange={(e) => setTypeFilter(e.target.value)}
              value={typeFilter}
            >
              <option value="all">Semua Jenis Transaksi</option>
              <option value="income">Pemasukan Saja</option>
              <option value="expense">Pengeluaran Saja</option>
              <option value="transfer">Transfer Antar Akun</option>
            </select>
          </div>

          {/* Filter Akun */}
          <div>
            <select
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
              onChange={(e) => setAccountFilter(e.target.value)}
              value={accountFilter}
            >
              <option value="all">Semua Akun Rekening</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kategori */}
          <div>
            <select
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
              onChange={(e) => setCategoryFilter(e.target.value)}
              value={categoryFilter}
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type === "income" ? "Masuk" : "Keluar"})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Tabel Mutasi Rekening */}
      <section aria-labelledby="tx-table-heading">
        <h3 className="sr-only" id="tx-table-heading">
          Daftar Catatan Transaksi
        </h3>

        {filteredTransactions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <ReceiptText className="mx-auto text-muted-foreground" size={36} />
            <h4 className="mt-3 text-base font-semibold">Tidak ada mutasi ditemukan</h4>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {transactions.length === 0
                ? "Mulai catat pemasukan, pengeluaran, atau transfer pertama Anda."
                : "Tidak ada transaksi yang cocok dengan filter yang dipilih."}
            </p>
            {transactions.length === 0 ? (
              <div className="mt-6">
                <Button onClick={() => openModalWithType("expense")} type="button">
                  <Plus aria-hidden="true" size={18} />
                  Catat Transaksi Pertama
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 sm:px-6">Tanggal & Waktu</th>
                    <th className="px-5 py-3.5 sm:px-6">Deskripsi & Akun</th>
                    <th className="px-5 py-3.5 sm:px-6">Kategori</th>
                    <th className="px-5 py-3.5 text-right sm:px-6">Nominal</th>
                    <th className="px-5 py-3.5 text-right sm:px-6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((tx) => {
                    const isIncome = tx.type === "income";
                    const isExpense = tx.type === "expense";
                    const isTransfer = tx.type === "transfer";

                    return (
                      <tr className="transition-colors hover:bg-muted/30" key={tx.id}>
                        {/* Tanggal */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-muted-foreground sm:px-6">
                          {formatDateTimeIndo(tx.occurred_at)}
                        </td>

                        {/* Deskripsi & Akun */}
                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                                isIncome
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : isExpense
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              }`}
                            >
                              {isIncome ? (
                                <ArrowDownLeft aria-hidden="true" size={17} />
                              ) : isExpense ? (
                                <ArrowUpRight aria-hidden="true" size={17} />
                              ) : (
                                <ArrowRightLeft aria-hidden="true" size={17} />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {tx.description ||
                                  (isTransfer
                                    ? "Pemindahan Dana"
                                    : isIncome
                                      ? "Pemasukan"
                                      : "Pengeluaran")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isTransfer
                                  ? `${accountMap.get(tx.account_id) || "Akun"} -> ${
                                      accountMap.get(tx.destination_account_id!) || "Tujuan"
                                    }`
                                  : accountMap.get(tx.account_id) || "Akun"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Kategori */}
                        <td className="px-5 py-4 sm:px-6">
                          {isTransfer ? (
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              Transfer Antar Akun
                            </span>
                          ) : tx.category_id ? (
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                              {categoryMap.get(tx.category_id) || "Kategori"}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Tanpa kategori</span>
                          )}
                        </td>

                        {/* Nominal */}
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

                        {/* Aksi Hapus */}
                        <td className="px-5 py-4 text-right sm:px-6">
                          <button
                            aria-label={`Hapus transaksi ${tx.description || ""}`}
                            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[#f9e1e1] hover:text-[#963647] focus-visible:outline-2 focus-visible:outline-[#b34455] dark:hover:bg-[#542d35] dark:hover:text-[#ffc4cb]"
                            onClick={() => handleDelete(tx.id)}
                            title="Hapus transaksi ini"
                            type="button"
                          >
                            <Trash2 aria-hidden="true" size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Modal Form Tambah Transaksi */}
      <TransactionFormModal
        accounts={accounts}
        categories={categories}
        defaultType={modalType}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
