import { AppShell } from "@/components/layout/app-shell";
import { SettingsView } from "@/components/settings/settings-view";
import { getUserProfile, requireUser } from "@/lib/supabase/auth";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getUserProfile();

  return (
    <AppShell>
      <section className="max-w-2xl">
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
          <Settings aria-hidden="true" size={24} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pengaturan</h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Kelola preferensi akun, format regional Rupiah, tema tampilan, dan keamanan sesi.
        </p>
      </section>

      <div className="mt-10 max-w-3xl">
        <SettingsView
          currency={profile?.currency ?? "IDR"}
          initialDisplayName={profile?.display_name ?? ""}
          timezone={profile?.timezone ?? "Asia/Jakarta"}
          userEmail={user?.email ?? null}
        />
      </div>
    </AppShell>
  );
}

