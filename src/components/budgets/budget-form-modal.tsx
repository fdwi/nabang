"use client";

import { createOrUpdateBudget, type BudgetActionState } from "@/actions/budgets";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";
import { X } from "lucide-react";
import { useActionState, useEffect } from "react";

type Category = Database["public"]["Tables"]["categories"]["Row"];

type BudgetFormModalProps = {
  categories: Category[];
  currentMonth: string; // 'YYYY-MM'
  isOpen: boolean;
  onClose: () => void;
};

const initialState: BudgetActionState = {};

export function BudgetFormModal({
  categories,
  currentMonth,
  isOpen,
  onClose,
}: BudgetFormModalProps) {
  const [state, formAction, isPending] = useActionState(
    createOrUpdateBudget,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  if (!isOpen) return null;

  const expenseCategories = categories.filter(
    (c) => c.type === "expense" && !c.is_archived
  );

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <button
          aria-label="Tutup form anggaran"
          className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>

        <h2 className="text-xl font-semibold">Tetapkan Anggaran Bulanan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tentukan batas pengeluaran maksimum untuk kategori tertentu.
        </p>

        {expenseCategories.length === 0 ? (
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Belum ada kategori pengeluaran aktif. Silakan tambahkan kategori pengeluaran di menu Akun & Saldo terlebih dahulu.
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="budget-cat">
                Kategori Pengeluaran
              </label>
              <select
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
                id="budget-cat"
                name="category_id"
                required
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="budget-month">
                Bulan Anggaran
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
                defaultValue={currentMonth}
                id="budget-month"
                name="month"
                required
                type="month"
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="budget-limit">
                Batas Anggaran (Rp)
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-lg font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
                id="budget-limit"
                min={1}
                name="limit_amount"
                placeholder="0"
                required
                step="1"
                type="number"
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
                {isPending ? "Menyimpan..." : "Simpan Anggaran"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
