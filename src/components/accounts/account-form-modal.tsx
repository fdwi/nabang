"use client";

import { createAccount, type AccountActionState } from "@/actions/accounts";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useActionState, useEffect } from "react";

type AccountFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const initialState: AccountActionState = {};

export function AccountFormModal({ isOpen, onClose }: AccountFormModalProps) {
  const [state, formAction, isPending] = useActionState(createAccount, initialState);

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
          aria-label="Tutup form akun"
          className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>

        <h2 className="text-xl font-semibold">Tambah Akun Baru</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Buat wadah penyimpanan dana seperti rekening bank, dompet tunai, atau e-wallet.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="acc-name">
              Nama Akun
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              id="acc-name"
              name="name"
              placeholder="Contoh: BCA Utama, Dompet Saku"
              required
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="acc-type">
              Tipe Akun
            </label>
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              defaultValue="bank"
              id="acc-type"
              name="account_type"
            >
              <option value="bank">Rekening Bank</option>
              <option value="cash">Uang Tunai</option>
              <option value="ewallet">E-Wallet</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="acc-balance">
              Saldo Awal (Rp)
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              defaultValue={0}
              id="acc-balance"
              min={0}
              name="opening_balance"
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
              {isPending ? "Menyimpan..." : "Simpan Akun"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
