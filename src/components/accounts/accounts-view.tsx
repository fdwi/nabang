"use client";

import { deleteAccount, toggleAccountStatus } from "@/actions/accounts";
import { toggleArchiveCategory } from "@/actions/categories";
import { AccountFormModal } from "@/components/accounts/account-form-modal";
import { CategoryFormModal } from "@/components/accounts/category-form-modal";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/formatters/currency";
import type { Database } from "@/types/database";
import {
  Archive,
  Banknote,
  Building2,
  CreditCard,
  Eye,
  EyeOff,
  Plus,
  Power,
  Trash2,
  Wallet,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

type Account = Database["public"]["Tables"]["accounts"]["Row"] & {
  currentBalance: number;
};
type Category = Database["public"]["Tables"]["categories"]["Row"];

type AccountsViewProps = {
  accounts: Account[];
  categories: Category[];
  totalBalance: number;
};

export function AccountsView({
  accounts,
  categories,
  totalBalance,
}: AccountsViewProps) {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);

  // Baca preferensi visibilitas saldo dari browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nabang_show_balance");
      if (saved !== null) {
        setShowBalance(saved === "true");
      }
    } catch {
      /* noop */
    }
  }, []);

  const handleToggleBalance = () => {
    setShowBalance((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("nabang_show_balance", String(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Building2 aria-hidden="true" size={20} />;
      case "cash":
        return <Banknote aria-hidden="true" size={20} />;
      case "ewallet":
        return <CreditCard aria-hidden="true" size={20} />;
      default:
        return <Wallet aria-hidden="true" size={20} />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "bank":
        return "Rekening Bank";
      case "cash":
        return "Dompet Tunai";
      case "ewallet":
        return "Dompet Digital (E-Wallet)";
      default:
        return "Kantong Finansial";
    }
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (!confirm(`Hapus akun "${name}"? Akun hanya dapat dihapus jika belum memiliki transaksi.`)) {
      return;
    }
    setActionError(null);
    const res = await deleteAccount(id);
    if (res?.error) {
      setActionError(res.error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setActionError(null);
    const res = await toggleAccountStatus(id, currentStatus);
    if (res?.error) {
      setActionError(res.error);
    }
  };

  const handleToggleCategory = async (id: string, currentArchived: boolean) => {
    setActionError(null);
    const res = await toggleArchiveCategory(id, currentArchived);
    if (res?.error) {
      setActionError(res.error);
    }
  };

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-10">
      {actionError ? (
        <div
          className="rounded-2xl border border-[#963647]/30 bg-[#f9e1e1]/70 p-4 text-sm text-[#8f3242] dark:border-[#ffb9c3]/30 dark:bg-[#542d35]/70 dark:text-[#ffc4cb]"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      {/* Ringkasan Saldo Akun Aktif ala Livin' Card Banner */}
      <section
        aria-labelledby="total-balance-heading"
        className="relative overflow-hidden rounded-3xl border border-pink-200/80 bg-gradient-to-r from-pink-50 via-white to-rose-50 p-6 shadow-sm sm:p-8 dark:border-pink-900/40 dark:from-[#2d1e22] dark:via-[#211518] dark:to-[#351e24]"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase" id="total-balance-heading">
                Total Saldo Seluruh Akun Aktif
              </h2>
              <button
                aria-label={showBalance ? "Sembunyikan nominal saldo" : "Tampilkan nominal saldo"}
                className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                onClick={handleToggleBalance}
                type="button"
              >
                {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {showBalance ? formatRupiah(totalBalance) : "Rp ••••••••••"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tergabung dari {accounts.filter((a) => a.is_active).length} akun aktif tersimpan.
            </p>
          </div>
          <Button onClick={() => setIsAccountModalOpen(true)} type="button">
            <Plus aria-hidden="true" size={18} />
            Tambah Akun Baru
          </Button>
        </div>
      </section>

      {/* Daftar Akun Finansial ala Kartu Debit Livin' Pink */}
      <section aria-labelledby="accounts-heading">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground" id="accounts-heading">
              Daftar Akun & Rekening
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Saldo otomatis terakumulasi berdasarkan mutasi transaksi dan transfer saldo.
            </p>
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
            <Wallet className="mx-auto text-muted-foreground" size={36} />
            <h3 className="mt-3 text-base font-semibold">Belum ada akun keuangan</h3>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Mulai dengan menambahkan akun seperti Dompet Tunai atau Rekening Bank Anda.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsAccountModalOpen(true)} type="button">
                <Plus aria-hidden="true" size={18} />
                Tambah Akun Pertama
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((acc) => (
              <div
                className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all hover:shadow-md ${
                  acc.is_active
                    ? "border-pink-200/80 bg-gradient-to-br from-card via-card to-pink-50/50 shadow-xs dark:border-pink-900/30 dark:to-pink-950/20"
                    : "border-border/60 bg-muted/40 opacity-70"
                }`}
                key={acc.id}
              >
                <div>
                  {/* Header Kartu: Ikon & Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-pink-100 text-[#8f3242] shadow-xs dark:bg-pink-950 dark:text-[#ffc4cb]">
                      {getAccountIcon(acc.account_type)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wifi aria-hidden="true" className="size-4 text-muted-foreground rotate-90" />
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          acc.is_active
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {acc.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>

                  {/* Nama Akun & Jenis */}
                  <div className="mt-5">
                    <h3 className="text-lg font-bold tracking-tight text-foreground">{acc.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {getAccountTypeLabel(acc.account_type)}
                    </p>
                  </div>

                  {/* Nominal Saldo */}
                  <div className="mt-4 rounded-2xl bg-background/80 p-3.5 border border-border/60">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Saldo Berjalan
                    </span>
                    <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-foreground">
                      {showBalance ? formatRupiah(acc.currentBalance) : "Rp ••••••••••"}
                    </p>
                  </div>
                </div>

                {/* Footer Kartu: Saldo Awal & Tombol Aksi */}
                <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-xs">
                  <span className="text-muted-foreground">
                    Awal: {showBalance ? formatRupiah(acc.opening_balance) : "••••••••"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      aria-label={acc.is_active ? "Nonaktifkan akun" : "Aktifkan akun"}
                      className="inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                      onClick={() => handleToggleStatus(acc.id, acc.is_active)}
                      title={acc.is_active ? "Nonaktifkan akun" : "Aktifkan kembali"}
                      type="button"
                    >
                      <Power aria-hidden="true" size={16} />
                    </button>
                    <button
                      aria-label="Hapus akun"
                      className="inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-[#f9e1e1] hover:text-[#963647] focus-visible:outline-2 focus-visible:outline-[#b34455] dark:hover:bg-[#542d35] dark:hover:text-[#ffb9c3]"
                      onClick={() => handleDeleteAccount(acc.id, acc.name)}
                      title="Hapus akun (hanya jika tanpa transaksi)"
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Manajemen Kategori Pengeluaran & Pemasukan */}
      <section aria-labelledby="categories-heading" className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground" id="categories-heading">
              Kategori Transaksi
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Kelompokkan pos pengeluaran dan sumber pemasukan untuk pemantauan yang rapi.
            </p>
          </div>
          <Button onClick={() => setIsCategoryModalOpen(true)} type="button">
            <Plus aria-hidden="true" size={18} />
            Tambah Kategori
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Kategori Pemasukan */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">
                Kategori Pemasukan
              </h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {incomeCategories.length} pos
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {incomeCategories.map((cat) => (
                <div
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs transition-colors ${
                    cat.is_archived
                      ? "border-border/50 bg-muted/40 text-muted-foreground"
                      : "border-emerald-200/60 bg-emerald-50/50 text-foreground dark:border-emerald-900/40 dark:bg-emerald-950/20"
                  }`}
                  key={cat.id}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: cat.color || "#2d7a4d" }}
                  />
                  <span className="font-medium">{cat.name}</span>
                  {cat.is_archived ? (
                    <span className="text-[10px] text-muted-foreground">(Arsip)</span>
                  ) : null}
                  <button
                    aria-label={cat.is_archived ? "Aktifkan kategori" : "Arsipkan kategori"}
                    className="ml-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                    onClick={() => handleToggleCategory(cat.id, cat.is_archived)}
                    title={cat.is_archived ? "Aktifkan kembali" : "Arsipkan kategori"}
                    type="button"
                  >
                    <Archive size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Kategori Pengeluaran */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">
                Kategori Pengeluaran
              </h3>
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                {expenseCategories.length} pos
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {expenseCategories.map((cat) => (
                <div
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs transition-colors ${
                    cat.is_archived
                      ? "border-border/50 bg-muted/40 text-muted-foreground"
                      : "border-rose-200/60 bg-rose-50/50 text-foreground dark:border-rose-900/40 dark:bg-rose-950/20"
                  }`}
                  key={cat.id}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: cat.color || "#e11d48" }}
                  />
                  <span className="font-medium">{cat.name}</span>
                  {cat.is_archived ? (
                    <span className="text-[10px] text-muted-foreground">(Arsip)</span>
                  ) : null}
                  <button
                    aria-label={cat.is_archived ? "Aktifkan kategori" : "Arsipkan kategori"}
                    className="ml-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                    onClick={() => handleToggleCategory(cat.id, cat.is_archived)}
                    title={cat.is_archived ? "Aktifkan kembali" : "Arsipkan kategori"}
                    type="button"
                  >
                    <Archive size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modal Akun & Kategori */}
      <AccountFormModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
}
