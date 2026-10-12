"use client";

import { deleteReminder, toggleReminderStatus } from "@/actions/reminders";
import { ReminderFormModal } from "@/components/reminders/reminder-form-modal";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/formatters/currency";
import type { Database } from "@/types/database";
import {
  Bell,
  Clock,
  Plus,
  Power,
  Trash2,
} from "lucide-react";
import { useState } from "react";

type Reminder = Database["public"]["Tables"]["reminders"]["Row"];

type RemindersViewProps = {
  reminders: Reminder[];
};

export function RemindersView({ reminders }: RemindersViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const getFrequencyLabel = (rem: Reminder) => {
    switch (rem.frequency) {
      case "daily":
        return "Setiap Hari";
      case "weekly":
        return `Setiap ${daysOfWeek[rem.day_of_week ?? 1]}`;
      case "monthly":
        return `Setiap Tanggal ${rem.day_of_month ?? 1}`;
      default:
        return rem.frequency;
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus pengingat "${title}"?`)) return;
    setActionError(null);
    const res = await deleteReminder(id);
    if (res?.error) {
      setActionError(res.error);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setActionError(null);
    const res = await toggleReminderStatus(id, currentStatus);
    if (res?.error) {
      setActionError(res.error);
    }
  };

  return (
    <div className="space-y-8">
      {actionError ? (
        <div
          className="rounded-xl border border-[#963647]/30 bg-[#f9e1e1]/60 p-4 text-sm text-[#8f3242] dark:border-[#ffb9c3]/30 dark:bg-[#542d35]/60 dark:text-[#ffc4cb]"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Jadwal Pengingat</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pengingat kebiasaan menabung yang aktif dalam aplikasi saat Anda membukanya.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} type="button">
          <Plus aria-hidden="true" size={18} />
          Buat Pengingat
        </Button>
      </div>

      {reminders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
          <Bell className="mx-auto text-muted-foreground" size={32} />
          <h3 className="mt-3 text-base font-semibold">Belum ada pengingat dibuat</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Buat jadwal rutin untuk membangun disiplin menabung harian, mingguan, atau bulanan.
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsModalOpen(true)} type="button">
              <Plus aria-hidden="true" size={18} />
              Buat Pengingat Pertama
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reminders.map((rem) => {
            const timeFormatted = rem.reminder_time.slice(0, 5);

            return (
              <div
                className={`flex flex-col justify-between rounded-xl border p-5 sm:p-6 ${
                  rem.is_enabled
                    ? "border-border bg-card"
                    : "border-border/60 bg-muted/40 opacity-70"
                }`}
                key={rem.id}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        rem.is_enabled
                          ? "bg-[#dcfce7] text-[#166534] dark:bg-[#14532d] dark:text-[#bbf7d0]"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {rem.is_enabled ? "Aktif" : "Nonaktif"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getFrequencyLabel(rem)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-semibold">{rem.title}</h3>

                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock aria-hidden="true" size={14} />
                    <span>Pukul {timeFormatted} WIB</span>
                  </div>

                  {rem.amount ? (
                    <div className="mt-2 text-sm font-semibold text-foreground">
                      Rekomendasi: {formatRupiah(rem.amount)}
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <button
                    aria-label={rem.is_enabled ? "Nonaktifkan pengingat" : "Aktifkan pengingat"}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#b34455]"
                    onClick={() => handleToggle(rem.id, rem.is_enabled)}
                    type="button"
                  >
                    <Power aria-hidden="true" size={14} />
                    {rem.is_enabled ? "Nonaktifkan" : "Aktifkan"}
                  </button>

                  <button
                    aria-label="Hapus pengingat"
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-[#f9e1e1] hover:text-[#963647] focus-visible:outline-2 focus-visible:outline-[#b34455] dark:hover:bg-[#542d35] dark:hover:text-[#ffc4cb]"
                    onClick={() => handleDelete(rem.id, rem.title)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ReminderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
