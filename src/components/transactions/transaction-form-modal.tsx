"use client";

import { createTransaction, type TransactionActionState } from "@/actions/transactions";
import { Button } from "@/components/ui/button";
import { toInputDateTime } from "@/lib/formatters/date";
import type { Database } from "@/types/database";
import { X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

type Account = Database["public"]["Tables"]["accounts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

type TransactionFormModalProps = {
  accounts: Account[];
  categories: Category[];
  defaultType?: "income" | "expense" | "transfer";
  isOpen: boolean;
  onClose: () => void;
};

const initialState: TransactionActionState = {};

export function TransactionFormModal({
  accounts,
  categories,
  defaultType = "expense",
  isOpen,
  onClose,
}: TransactionFormModalProps) {
  const [txType, setTxType] = useState<"income" | "expense" | "transfer">(defaultType);
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || "");
  const [destAccountId, setDestAccountId] = useState(
    accounts.length > 1 ? accounts[1]?.id : ""
  );
  const [state, formAction, isPending] = useActionState(createTransaction, initialState);

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTxType(defaultType);
    }
  }, [isOpen, defaultType]);

  useEffect(() => {
    if (accounts.length > 0 && !sourceAccountId) {
      setSourceAccountId(accounts[0].id);
    }
    if (accounts.length > 1 && !destAccountId) {
      setDestAccountId(accounts[1].id);
    }
  }, [accounts, sourceAccountId, destAccountId]);

  if (!isOpen) return null;

  const activeAccounts = accounts.filter((a) => a.is_active);
  const filteredCategories = categories.filter(
    (c) => c.type === txType && !c.is_archived
  );

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
    >
      <div className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <button
          aria-label="Tutup form transaksi"
          className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>

        <h2 className="text-xl font-semibold">Catat Transaksi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pemasukan, pengeluaran, atau pemindahan saldo antar-akun Anda.
        </p>

        {activeAccounts.length === 0 ? (
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Anda belum memiliki akun aktif. Silakan tambahkan akun terlebih dahulu di halaman Akun & Saldo.
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            {/* Pemilih Tipe Transaksi */}
            <div>
              <label className="block text-sm font-medium">Jenis Transaksi</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  className={`min-h-11 rounded-lg border text-sm font-medium transition-colors ${
                    txType === "expense"
                      ? "border-[#b34455] bg-[#f9e1e1] text-[#8f3242] dark:border-[#ffb9c3] dark:bg-[#542d35] dark:text-[#ffc4cb]"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setTxType("expense")}
                  type="button"
                >
                  Pengeluaran
                </button>
                <button
                  className={`min-h-11 rounded-lg border text-sm font-medium transition-colors ${
                    txType === "income"
                      ? "border-[#2d7a4d] bg-[#dcfce7] text-[#166534] dark:border-[#86efac] dark:bg-[#14532d] dark:text-[#bbf7d0]"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setTxType("income")}
                  type="button"
                >
                  Pemasukan
                </button>
                <button
                  className={`min-h-11 rounded-lg border text-sm font-medium transition-colors ${
                    txType === "transfer"
                      ? "border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setTxType("transfer")}
                  type="button"
                >
                  Transfer
                </button>
              </div>
              <input name="type" type="hidden" value={txType} />
            </div>

            {/* Nominal */}
            <div>
              <label className="block text-sm font-medium" htmlFor="tx-amount">
                Nominal (Rp)
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-lg font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                id="tx-amount"
                min={1}
                name="amount"
                placeholder="0"
                required
                step="1"
                type="number"
              />
            </div>

            {/* Akun Sumber */}
            <div>
              <label className="block text-sm font-medium" htmlFor="tx-source">
                {txType === "transfer" ? "Dari Akun (Sumber)" : "Pilih Akun"}
              </label>
              <select
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                id="tx-source"
                name="account_id"
                onChange={(e) => setSourceAccountId(e.target.value)}
                required
                value={sourceAccountId}
              >
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.account_type})
                  </option>
                ))}
              </select>
            </div>

            {/* Akun Tujuan (Khusus Transfer) */}
            {txType === "transfer" ? (
              <div>
                <label className="block text-sm font-medium" htmlFor="tx-dest">
                  Ke Akun (Tujuan)
                </label>
                <select
                  className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                  id="tx-dest"
                  name="destination_account_id"
                  onChange={(e) => setDestAccountId(e.target.value)}
                  required
                  value={destAccountId}
                >
                  {activeAccounts
                    .filter((acc) => acc.id !== sourceAccountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.account_type})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              /* Kategori (Pemasukan / Pengeluaran) */
              <div>
                <label className="block text-sm font-medium" htmlFor="tx-cat">
                  Kategori
                </label>
                {filteredCategories.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Belum ada kategori untuk jenis ini. Anda dapat menambahkannya di halaman Akun & Saldo.
                  </p>
                ) : (
                  <select
                    className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                    id="tx-cat"
                    name="category_id"
                    required
                  >
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Tanggal & Waktu */}
            <div>
              <label className="block text-sm font-medium" htmlFor="tx-date">
                Tanggal & Waktu
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                defaultValue={toInputDateTime()}
                id="tx-date"
                name="occurred_at"
                required
                type="datetime-local"
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium" htmlFor="tx-desc">
                Catatan Opsional
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                id="tx-desc"
                maxLength={500}
                name="description"
                placeholder="Contoh: Makan siang nasi padang"
                type="text"
              />
            </div>

            {state.error ? (
              <p className="text-sm text-[#963647] dark:text-[#ffb9c3]" role="alert">
                {state.error}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-transparent px-4 text-sm font-medium hover:bg-muted"
                onClick={onClose}
                type="button"
              >
                Batal
              </button>
              <Button disabled={isPending} type="submit">
                {isPending ? "Menyimpan..." : "Simpan Transaksi"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
