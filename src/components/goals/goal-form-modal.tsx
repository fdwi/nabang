"use client";

import { createGoal, type GoalActionState } from "@/actions/goals";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useActionState, useEffect } from "react";

type GoalFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const initialState: GoalActionState = {};

export function GoalFormModal({ isOpen, onClose }: GoalFormModalProps) {
  const [state, formAction, isPending] = useActionState(createGoal, initialState);

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
          aria-label="Tutup form target"
          className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>

        <h2 className="text-xl font-semibold">Buat Target Tabungan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Rencanakan dana masa depan, seperti dana darurat, liburan, atau gadget baru.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="goal-name">
              Nama Target
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              id="goal-name"
              name="name"
              placeholder="Contoh: Dana Darurat 6 Bulan"
              required
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="goal-amount">
              Nominal Target (Rp)
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              id="goal-amount"
              min={1}
              name="target_amount"
              placeholder="0"
              required
              step="1"
              type="number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="goal-initial">
              Saldo Awal Tabungan (Rp)
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              defaultValue={0}
              id="goal-initial"
              min={0}
              name="initial_amount"
              step="1"
              type="number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="goal-deadline">
              Tenggat Waktu (Opsional)
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              id="goal-deadline"
              name="deadline"
              type="date"
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
              {isPending ? "Menyimpan..." : "Simpan Target"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
