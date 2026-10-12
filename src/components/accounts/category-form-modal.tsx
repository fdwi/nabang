"use client";

import { createCategory, type CategoryActionState } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useActionState, useEffect } from "react";

type CategoryFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const initialState: CategoryActionState = {};

export function CategoryFormModal({ isOpen, onClose }: CategoryFormModalProps) {
  const [state, formAction, isPending] = useActionState(createCategory, initialState);

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <button
          aria-label="Tutup form kategori"
          className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>

        <h2 className="text-xl font-semibold">Tambah Kategori Baru</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelompokkan pos pengeluaran atau pemasukan Anda.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="cat-name">
              Nama Kategori
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              id="cat-name"
              name="name"
              placeholder="Contoh: Belanja Bulanan, Freelance"
              required
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="cat-type">
              Tipe Transaksi
            </label>
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              defaultValue="expense"
              id="cat-type"
              name="type"
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
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
              {isPending ? "Menyimpan..." : "Simpan Kategori"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
