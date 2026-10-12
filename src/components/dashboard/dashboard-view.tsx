"use client";

import { AccountBreakdown } from "@/components/dashboard/account-breakdown";
import { CashflowChart, type ChartDataPoint } from "@/components/dashboard/cashflow-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { StatCard } from "@/components/dashboard/stat-card";
import { TransactionFormModal } from "@/components/transactions/transaction-form-modal";
import { formatRupiah } from "@/lib/formatters/currency";
import type { Database } from "@/types/database";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Eye,
  EyeOff,
  PieChart,
  Plus,
  Scale,
  Sparkles,
  Target,
  Wallet,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Account = Database["public"]["Tables"]["accounts"]["Row"] & {
  currentBalance: number;
};
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

type DashboardViewProps = {
  accounts: Account[];
  categories: Category[];
  displayName?: string;
  totalBalance: number;
  transactions: Transaction[];
};

export function DashboardView({
  accounts,
  categories,
  displayName = "Pemilik",
  totalBalance,
  transactions,
}: DashboardViewProps) {
  const [period, setPeriod] = useState<"this_month" | "last_3_months" | "this_year" | "all">(
    "this_month"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"income" | "expense" | "transfer">("expense");
  const [showBalance, setShowBalance] = useState(true);

  // Sapaan dinamis berdasarkan jam lokal
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return "Selamat Pagi";
    if (hour >= 11 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  }, []);

  // Filter transaksi berdasarkan periode yang dipilih
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((tx) => {
      const txDate = new Date(tx.occurred_at);

      if (period === "this_month") {
        return (
          txDate.getFullYear() === currentYear &&
          txDate.getMonth() === currentMonth
        );
      }

      if (period === "last_3_months") {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return txDate >= threeMonthsAgo;
      }

      if (period === "this_year") {
        return txDate.getFullYear() === currentYear;
      }

      return true;
    });
  }, [transactions, period]);

  // Hitung metrik periode
  const periodIncome = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [filteredTransactions]);

  const periodExpense = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [filteredTransactions]);

  const cashFlow = periodIncome - periodExpense;

  // Siapkan data grafik bulanan (6 bulan terakhir)
  const chartData: ChartDataPoint[] = useMemo(() => {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];

    const points: ChartDataPoint[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();

      const txsInMonth = transactions.filter((tx) => {
        const tDate = new Date(tx.occurred_at);
        return tDate.getFullYear() === y && tDate.getMonth() === m;
      });

      const income = txsInMonth
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      const expense = txsInMonth
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      points.push({
        label: `${monthNames[m]} ${y !== now.getFullYear() ? `'${String(y).slice(2)}` : ""}`,
        income,
        expense,
      });
    }

    return points;
  }, [transactions]);

  const openModal = (type: "income" | "expense" | "transfer") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Sapaan Pengguna ala Livin' Mobile Banking */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[#b34455] uppercase dark:text-[#ffb9c3]">
            {greeting},
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {displayName}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Pantau dan kelola keuangan harian Anda dengan mudah.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-pink-200 bg-pink-50/80 px-3 py-1.5 text-xs font-medium text-pink-900 backdrop-blur-xs sm:self-auto dark:border-pink-900/50 dark:bg-pink-950/40 dark:text-pink-200">
          <Sparkles className="size-3.5 text-pink-600 dark:text-pink-300" />
          <span>DwiSave Platinum Priority</span>
        </div>
      </div>

      {/* Hero Section: Kartu Virtual ala Livin' Mandiri Versi Pink & Banner Bergambar */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Kartu Virtual Platinum Pink */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#7a0c2e] via-[#be123c] to-[#fb7185] p-6 text-white shadow-xl shadow-rose-950/15 sm:p-7 lg:col-span-6 xl:col-span-5">
          {/* Efek Garis & Lingkaran Geometris Halus */}
          <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-pink-300/10 blur-2xl" />

          {/* Baris Atas Kartu: Logo Brand & Chip Pintar */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                <CreditCard className="size-5 text-pink-100" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-pink-200 uppercase">
                  DwiSave
                </p>
                <p className="text-[11px] font-medium text-pink-100/90">
                  Virtual Platinum
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-pink-100/90">
              <Wifi aria-hidden="true" className="size-5 rotate-90" />
              <div className="h-6 w-9 rounded-md border border-amber-300/60 bg-gradient-to-tr from-amber-400/90 to-amber-200/90 shadow-xs" />
            </div>
          </div>

          {/* Baris Tengah: Saldo & Tombol Sembunyikan/Tampilkan Mata */}
          <div className="relative mt-7">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-pink-200">
                Total Saldo Rekening
              </span>
              <button
                aria-label={showBalance ? "Sembunyikan nominal saldo" : "Tampilkan nominal saldo"}
                className="inline-flex size-7 items-center justify-center rounded-full text-pink-200 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                onClick={() => setShowBalance(!showBalance)}
                type="button"
              >
                {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>

            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {showBalance ? formatRupiah(totalBalance) : "Rp ••••••••••"}
              </span>
            </div>
          </div>

          {/* Baris Bawah: Nomor Kartu & Nama Pemilik */}
          <div className="relative mt-8 flex items-end justify-between border-t border-white/15 pt-4 text-xs">
            <div>
              <p className="font-mono tracking-widest text-pink-200/90">
                5241 •••• •••• 8829
              </p>
              <p className="mt-1 font-semibold tracking-wide text-white uppercase">
                {displayName}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-pink-200 uppercase">Valid Thru</p>
              <p className="font-mono font-medium text-pink-100">10/29</p>
            </div>
          </div>
        </div>

        {/* Banner Ilustrasi Keuangan 3D Bergambar (Gaya Livin' Lifestyle Promo) */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-pink-200/80 bg-gradient-to-br from-pink-50/90 via-white to-rose-50/80 p-6 shadow-sm sm:p-7 lg:col-span-6 xl:col-span-7 dark:border-pink-900/40 dark:from-[#2d1e22] dark:via-[#211518] dark:to-[#351e24]">
          <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-900 dark:bg-pink-950 dark:text-pink-200">
                <Sparkles className="size-3.5 text-[#b34455] dark:text-[#ffb9c3]" />
                Nabang Impian
              </span>
              <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Wujudkan Target Finansial Anda
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Kelola setoran rutin ke target tabungan dan pantau batas anggaran bulanan agar rencana masa depan tercapai tepat waktu.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#b34455] px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#963647] focus-visible:outline-2 focus-visible:outline-[#b34455]"
                  href="/target"
                >
                  <Target className="mr-1.5 size-4" />
                  Buka Target Tabungan
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#b34455]"
                  href="/anggaran"
                >
                  <PieChart className="mr-1.5 size-4" />
                  Cek Anggaran
                </Link>
              </div>
            </div>

            {/* Gambar Ilustrasi 3D Pink Bank Mandiri Style */}
            <div className="relative mx-auto size-40 shrink-0 overflow-hidden rounded-2xl border border-pink-300/40 shadow-md sm:mx-0 sm:size-44 dark:border-pink-800/40">
              <Image
                alt="Ilustrasi Tabungan 3D DwiSave Versi Pink"
                className="object-cover transition-transform duration-300 hover:scale-105"
                fill
                priority
                src="/images/livin-pink-hero.jpg"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Aksi Cepat Ikon Bulat ala Livin' by Mandiri */}
      <section aria-label="Menu Transaksi Cepat" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-foreground">
            Aksi Cepat & Menu Keuangan
          </h3>
          <span className="text-xs text-muted-foreground">Pintasan Layanan</span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
          {/* 1. Transfer */}
          <button
            className="group flex flex-col items-center gap-2 rounded-xl p-2 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#b34455]"
            onClick={() => openModal("transfer")}
            type="button"
          >
            <div className="flex size-13 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-sm transition-colors group-hover:bg-blue-200 dark:bg-blue-950/70 dark:text-blue-200">
              <ArrowLeftRight className="size-6" />
            </div>
            <span className="text-xs font-semibold text-foreground">Transfer</span>
          </button>

          {/* 2. Pemasukan */}
          <button
            className="group flex flex-col items-center gap-2 rounded-xl p-2 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#b34455]"
            onClick={() => openModal("income")}
            type="button"
          >
            <div className="flex size-13 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm transition-colors group-hover:bg-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-200">
              <ArrowDownLeft className="size-6" />
            </div>
            <span className="text-xs font-semibold text-foreground">Pemasukan</span>
          </button>

          {/* 3. Pengeluaran */}
          <button
            className="group flex flex-col items-center gap-2 rounded-xl p-2 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#b34455]"
            onClick={() => openModal("expense")}
            type="button"
          >
            <div className="flex size-13 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 shadow-sm transition-colors group-hover:bg-rose-200 dark:bg-rose-950/70 dark:text-rose-200">
              <ArrowUpRight className="size-6" />
            </div>
            <span className="text-xs font-semibold text-foreground">Pengeluaran</span>
          </button>

          {/* 4. Target Tabungan */}
          <Link
            className="group flex flex-col items-center gap-2 rounded-xl p-2 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#b34455]"
            href="/target"
          >
            <div className="flex size-13 items-center justify-center rounded-2xl bg-pink-100 text-pink-700 shadow-sm transition-colors group-hover:bg-pink-200 dark:bg-pink-950/70 dark:text-pink-200">
              <Target className="size-6" />
            </div>
            <span className="text-xs font-semibold text-foreground">Target</span>
          </Link>

          {/* 5. Anggaran */}
          <Link
            className="group flex flex-col items-center gap-2 rounded-xl p-2 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#b34455]"
            href="/anggaran"
          >
            <div className="flex size-13 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm transition-colors group-hover:bg-amber-200 dark:bg-amber-950/70 dark:text-amber-200">
              <PieChart className="size-6" />
            </div>
            <span className="text-xs font-semibold text-foreground">Anggaran</span>
          </Link>

          {/* 6. Laporan */}
          <Link
            className="group flex flex-col items-center gap-2 rounded-xl p-2 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#b34455]"
            href="/laporan"
          >
            <div className="flex size-13 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm transition-colors group-hover:bg-purple-200 dark:bg-purple-950/70 dark:text-purple-200">
              <BarChart3 className="size-6" />
            </div>
            <span className="text-xs font-semibold text-foreground">Laporan</span>
          </Link>
        </div>
      </section>

      {/* Baris Filter Periode & Ringkasan Metrik Finansial */}
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground sm:text-sm">Filter Periode:</span>
            <div className="flex flex-wrap gap-1">
              {[
                { id: "this_month", label: "Bulan Ini" },
                { id: "last_3_months", label: "3 Bulan" },
                { id: "this_year", label: "Tahun Ini" },
                { id: "all", label: "Semua" },
              ].map(({ id, label }) => (
                <button
                  className={`min-h-10 rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#b34455] ${
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
          </div>

          <button
            className="inline-flex min-h-11 items-center justify-center gap-1.5 self-start rounded-xl bg-[#b34455] px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#963647] focus-visible:outline-2 focus-visible:outline-[#b34455] sm:self-auto"
            onClick={() => openModal("expense")}
            type="button"
          >
            <Plus aria-hidden="true" size={17} />
            Catat Transaksi
          </button>
        </div>

        {/* 4 Kartu Metrik Ringkasan Saldo & Arus Kas */}
        <section aria-label="Ringkasan saldo dan arus kas" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            description="Total saldo dari seluruh akun aktif"
            icon={Wallet}
            title="Total Saldo"
            trend="neutral"
            value={totalBalance}
          />
          <StatCard
            description="Total arus masuk pada periode ini"
            icon={ArrowDownLeft}
            title="Pemasukan"
            trend="positive"
            value={periodIncome}
          />
          <StatCard
            description="Total arus keluar pada periode ini"
            icon={ArrowUpRight}
            title="Pengeluaran"
            trend="negative"
            value={periodExpense}
          />
          <StatCard
            description="Selisih pemasukan dan pengeluaran"
            icon={Scale}
            title="Arus Kas Bersih"
            trend={cashFlow >= 0 ? "positive" : "negative"}
            value={cashFlow}
          />
        </section>
      </div>

      {/* Bagian Grafik Tren Arus Kas 6 Bulan Terakhir */}
      <section
        aria-labelledby="chart-heading"
        className="rounded-2xl border border-border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold" id="chart-heading">
              Tren Arus Kas (6 Bulan Terakhir)
            </h3>
            <p className="text-xs text-muted-foreground">
              Perbandingan nominal pemasukan dan pengeluaran setiap bulan.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <CashflowChart data={chartData} />
        </div>
      </section>

      {/* Grid: Transaksi Terbaru & Alokasi Akun */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions
          accounts={accounts}
          categories={categories}
          transactions={transactions}
        />
        <AccountBreakdown
          accounts={accounts}
          totalBalance={totalBalance}
        />
      </div>

      {/* Modal Cepat Tambah Transaksi */}
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
