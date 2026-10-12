"use client";

import { deleteGoal, updateGoalStatus } from "@/actions/goals";
import { ContributionModal } from "@/components/goals/contribution-modal";
import { GoalFormModal } from "@/components/goals/goal-form-modal";
import { Button } from "@/components/ui/button";
import type { GoalProgress } from "@/lib/finance/goal-calculations";
import { formatRupiah } from "@/lib/formatters/currency";
import { formatDateIndo } from "@/lib/formatters/date";
import type { Database } from "@/types/database";
import {
  Calendar,
  CheckCircle2,
  Pause,
  Play,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { useState } from "react";

type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"];
type Account = Database["public"]["Tables"]["accounts"]["Row"];

export type GoalWithProgress = SavingsGoal & {
  progress: GoalProgress;
};

type GoalsViewProps = {
  accounts: Account[];
  goals: GoalWithProgress[];
};

export function GoalsView({ accounts, goals }: GoalsViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGoalForContrib, setSelectedGoalForContrib] = useState<SavingsGoal | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const totalSaved = goals.reduce((sum, g) => sum + g.progress.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus target tabungan "${name}"? Seluruh riwayat kontribusi target ini akan dihapus.`)) {
      return;
    }
    setActionError(null);
    const res = await deleteGoal(id);
    if (res?.error) {
      setActionError(res.error);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "active" | "completed" | "paused" | "cancelled"
  ) => {
    setActionError(null);
    const res = await updateGoalStatus(id, newStatus);
    if (res?.error) {
      setActionError(res.error);
    }
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

      {/* Ringkasan Akumulasi Target ala Livin' Savings Banner */}
      <section
        aria-labelledby="goals-summary-heading"
        className="relative overflow-hidden rounded-3xl border border-pink-200/80 bg-gradient-to-r from-pink-50 via-white to-rose-50 p-6 shadow-sm sm:p-8 dark:border-pink-900/40 dark:from-[#2d1e22] dark:via-[#211518] dark:to-[#351e24]"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase" id="goals-summary-heading">
              Tabungan Rencana & Target Impian
            </h2>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {formatRupiah(totalSaved)}
              </span>
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                dari total sasaran {formatRupiah(totalTarget)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {goals.filter((g) => g.progress.isCompleted).length} dari {goals.length} target telah berhasil dicapai.
            </p>
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} type="button">
            <Plus aria-hidden="true" size={18} />
            Buat Target Baru
          </Button>
        </div>
      </section>

      {/* Daftar Target Tabungan ala Livin' Card */}
      <section aria-labelledby="goals-list-heading">
        <h3 className="sr-only" id="goals-list-heading">
          Daftar Target Tabungan Anda
        </h3>

        {goals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <Target className="mx-auto text-muted-foreground" size={36} />
            <h4 className="mt-3 text-base font-semibold">Belum ada target tabungan</h4>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Mulai rencanakan tujuan keuangan Anda seperti dana darurat, pembelian aset, atau tabungan liburan.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsAddModalOpen(true)} type="button">
                <Plus aria-hidden="true" size={18} />
                Buat Target Pertama
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((g) => {
              const isFinished = g.progress.isCompleted || g.status === "completed";

              return (
                <div
                  className="flex flex-col justify-between overflow-hidden rounded-3xl border border-pink-200/80 bg-gradient-to-br from-card via-card to-pink-50/50 p-6 shadow-xs transition-all hover:shadow-md dark:border-pink-900/30 dark:to-pink-950/20"
                  key={g.id}
                >
                  <div>
                    {/* Header Kartu Target */}
                    <div className="flex items-start justify-between">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-pink-100 text-[#8f3242] shadow-xs dark:bg-pink-950 dark:text-[#ffc4cb]">
                        <Target aria-hidden="true" size={20} />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isFinished
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : g.status === "paused"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-pink-100 text-[#8f3242] dark:bg-pink-950 dark:text-[#ffc4cb]"
                        }`}
                      >
                        {isFinished ? (
                          <>
                            <CheckCircle2 aria-hidden="true" size={12} />
                            Tercapai
                          </>
                        ) : g.status === "paused" ? (
                          "Dijeda"
                        ) : (
                          "Aktif"
                        )}
                      </span>
                    </div>

                    <h4 className="mt-4 text-lg font-bold tracking-tight text-foreground">{g.name}</h4>

                    {/* Progres Tabungan */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#b34455] dark:text-[#ffb9c3]">
                          {g.progress.percentage}% Tercapai
                        </span>
                        <span className="text-muted-foreground">
                          Target: {formatRupiah(g.target_amount)}
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFinished
                              ? "bg-emerald-600 dark:bg-emerald-400"
                              : "bg-gradient-to-r from-[#be123c] to-[#fb7185]"
                          }`}
                          style={{ width: `${Math.min(g.progress.percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Rincian Terkumpul & Sisa */}
                    <div className="mt-5 rounded-2xl border border-border/70 bg-background/80 p-3.5 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Terkumpul:</span>
                        <span className="font-bold text-foreground">
                          {formatRupiah(g.progress.currentAmount)}
                        </span>
                      </div>
                      {!isFinished ? (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Sisa Target:</span>
                          <span className="font-medium text-foreground">
                            {formatRupiah(g.progress.remainingAmount)}
                          </span>
                        </div>
                      ) : null}
                      {g.deadline ? (
                        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Tenggat:
                          </span>
                          <span>{formatDateIndo(g.deadline)}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Tombol Aksi Bawah */}
                  <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#b34455] px-3.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#963647] focus-visible:outline-2 focus-visible:outline-[#b34455]"
                      onClick={() => setSelectedGoalForContrib(g)}
                      type="button"
                    >
                      <Plus aria-hidden="true" className="mr-1" size={14} />
                      Setor / Tarik
                    </button>

                    <div className="flex items-center gap-1">
                      {g.status === "active" ? (
                        <button
                          aria-label="Jeda target tabungan"
                          className="inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                          onClick={() => handleStatusChange(g.id, "paused")}
                          title="Jeda target"
                          type="button"
                        >
                          <Pause aria-hidden="true" size={15} />
                        </button>
                      ) : g.status === "paused" ? (
                        <button
                          aria-label="Lanjutkan target tabungan"
                          className="inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                          onClick={() => handleStatusChange(g.id, "active")}
                          title="Aktifkan target"
                          type="button"
                        >
                          <Play aria-hidden="true" size={15} />
                        </button>
                      ) : null}

                      <button
                        aria-label={`Hapus target ${g.name}`}
                        className="inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-[#f9e1e1] hover:text-[#963647] focus-visible:outline-2 focus-visible:outline-[#b34455] dark:hover:bg-[#542d35] dark:hover:text-[#ffc4cb]"
                        onClick={() => handleDelete(g.id, g.name)}
                        title="Hapus target tabungan"
                        type="button"
                      >
                        <Trash2 aria-hidden="true" size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Tambah Target */}
      <GoalFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Modal Kontribusi Setoran/Penarikan Target */}
      <ContributionModal
        accounts={accounts}
        goal={selectedGoalForContrib}
        isOpen={selectedGoalForContrib !== null}
        onClose={() => setSelectedGoalForContrib(null)}
      />
    </div>
  );
}
