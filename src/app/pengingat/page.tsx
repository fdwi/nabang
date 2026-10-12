import { AppShell } from "@/components/layout/app-shell";
import { RemindersView } from "@/components/reminders/reminders-view";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { Bell } from "lucide-react";

type Reminder = Database["public"]["Tables"]["reminders"]["Row"];

export default async function RemindersPage() {
  let reminders: Reminder[] = [];
  let isConfigured = true;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      reminders = data || [];
    }
  } catch {
    isConfigured = false;
  }

  return (
    <AppShell>
      <section className="max-w-2xl">
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
          <Bell aria-hidden="true" size={24} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Pengingat Menabung
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Bangun kebiasaan menabung yang konsisten dengan jadwal pengingat lokal harian, mingguan, atau bulanan.
        </p>

        {!isConfigured ? (
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Konfigurasi Supabase belum terhubung di `.env.local`. Pastikan environment variables telah diisi agar jadwal pengingat tersimpan.
          </div>
        ) : null}
      </section>

      <div className="mt-10">
        <RemindersView reminders={reminders} />
      </div>
    </AppShell>
  );
}
