"use client";

import { createGoalContribution, type GoalActionState } from "@/actions/goals";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";
import { X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"];
type Account = Database["public"]["Tables"]["accounts"]["Row"];

type ContributionModalProps = {
  accounts: Account[];
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
};

const initialState: GoalActionState = {};

export function ContributionModal({
  accounts,
  goal,
  isOpen,
  onClose,
}: ContributionModalProps) {
  const [contributionType, setContributionType] = useState<"deposit" | "withdrawal">(
    "deposit"
  );
  const [state, formAction, isPending] = useActionState(
    createGoalContribution,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  if (!isOpen || !goal) return null;

  const activeAccounts = accounts.filter((a) => a.is_active);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <button
          aria-label="Tutup form kontribusi"
          className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>

        <h2 className="text-xl font-semibold">
          {contributionType === "deposit" ? "Setor Tabungan" : "Tarik Tabungan"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Target: <strong className="text-foreground">{goal.name}</strong>
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <input name="goal_id" type="hidden" value={goal.id} />

          {/* Pemilih Tipe */}
          <div>
            <label className="block text-sm font-medium">Jenis Operasi</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                className={`min-h-11 rounded-lg border text-sm font-medium transition-colors ${
                  contributionType === "deposit"
                    ? "border-[#2d7a4d] bg-[#dcfce7] text-[#166534] dark:border-[#86efac] dark:bg-[#14532d] dark:text-[#bbf7d0]"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => setContributionType("deposit")}
                type="button"
              >
                Setor Dana (+)
              </button>
              <button
                className={`min-h-11 rounded-lg border text-sm font-medium transition-colors ${
                  contributionType === "withdrawal"
                    ? "border-[#b34455] bg-[#f9e1e1] text-[#8f3242] dark:border-[#ffb9c3] dark:bg-[#542d35] dark:text-[#ffc4cb]"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => setContributionType("withdrawal")}
                type="button"
              >
                Tarik Dana (-)
              </button>
            </div>
            <input name="contribution_type" type="hidden" value={contributionType} />
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-sm font-medium" htmlFor="contrib-amount">
              Nominal (Rp)
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-lg font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              id="contrib-amount"
              min={1}
              name="amount"
              placeholder="0"
              required
              step="1"
              type="number"
            />
          </div>

          {/* Opsi Hubungkan ke Akun Keuangan */}
          <div>
            <label className="block text-sm font-medium" htmlFor="contrib-acc">
              Potong / Masukkan ke Akun (Opsional)
            </label>
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              defaultValue=""
              id="contrib-acc"
              name="account_id"
            >
              <option value="">Jangan hubungkan ke saldo akun</option>
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.account_type})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Jika dipilih, mutasi otomatis dicatat agar saldo akun Anda tetap sinkron.
            </p>
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
              {isPending ? "Memproses..." : "Konfirmasi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
