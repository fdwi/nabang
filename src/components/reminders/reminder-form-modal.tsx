"use client";

import { createReminder, type ReminderActionState } from "@/actions/reminders";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

type ReminderFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const initialState: ReminderActionState = {};

export function ReminderFormModal({ isOpen, onClose }: ReminderFormModalProps) {
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [state, formAction, isPending] = useActionState(
    createReminder,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  if (!isOpen) return null;

  const daysOfWeek = [
    { value: 1, label: "Senin" },
    { value: 2, label: "Selasa" },
    { value: 3, label: "Rabu" },
    { value: 4, label: "Kamis" },
    { value: 5, label: "Jumat" },
    { value: 6, label: "Sabtu" },
    { value: 0, label: "Minggu" },
  ];

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <button
          aria-label="Tutup form pengingat"
          className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>

        <h2 className="text-xl font-semibold">Buat Pengingat Menabung</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jadwalkan pengingat berkala untuk menyisihkan uang ke pos tabungan Anda.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="rem-title">
              Judul Pengingat
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              id="rem-title"
              name="title"
              placeholder="Contoh: Sisihkan uang jajan ke tabungan"
              required
              type="text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="rem-amount">
              Nominal yang Disarankan (Opsional)
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              id="rem-amount"
              min={1}
              name="amount"
              placeholder="Contoh: 50000"
              step="1"
              type="number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Frekuensi</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                className={`min-h-11 rounded-lg border text-sm font-medium transition-colors ${
                  frequency === "daily"
                    ? "border-[#b34455] bg-[#f9e1e1] text-[#8f3242] dark:border-[#ffb9c3] dark:bg-[#542d35] dark:text-[#ffc4cb]"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => setFrequency("daily")}
                type="button"
              >
                Harian
              </button>
              <button
                className={`min-h-11 rounded-lg border text-sm font-medium transition-colors ${
                  frequency === "weekly"
                    ? "border-[#b34455] bg-[#f9e1e1] text-[#8f3242] dark:border-[#ffb9c3] dark:bg-[#542d35] dark:text-[#ffc4cb]"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => setFrequency("weekly")}
                type="button"
              >
                Mingguan
              </button>
              <button
                className={`min-h-11 rounded-lg border text-sm font-medium transition-colors ${
                  frequency === "monthly"
                    ? "border-[#b34455] bg-[#f9e1e1] text-[#8f3242] dark:border-[#ffb9c3] dark:bg-[#542d35] dark:text-[#ffc4cb]"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                onClick={() => setFrequency("monthly")}
                type="button"
              >
                Bulanan
              </button>
            </div>
            <input name="frequency" type="hidden" value={frequency} />
          </div>

          {frequency === "weekly" ? (
            <div>
              <label className="block text-sm font-medium" htmlFor="rem-day-w">
                Hari Setiap Minggu
              </label>
              <select
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                defaultValue={1}
                id="rem-day-w"
                name="day_of_week"
              >
                {daysOfWeek.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {frequency === "monthly" ? (
            <div>
              <label className="block text-sm font-medium" htmlFor="rem-day-m">
                Tanggal Setiap Bulan (1 - 31)
              </label>
              <input
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                defaultValue={1}
                id="rem-day-m"
                max={31}
                min={1}
                name="day_of_month"
                type="number"
              />
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium" htmlFor="rem-time">
              Waktu Pengingat (WIB)
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455]"
              defaultValue="19:00"
              id="rem-time"
              name="reminder_time"
              required
              type="time"
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
              {isPending ? "Menyimpan..." : "Simpan Pengingat"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
