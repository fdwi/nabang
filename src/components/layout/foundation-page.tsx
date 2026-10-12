import { AppShell } from "@/components/layout/app-shell";
import type { LucideIcon } from "lucide-react";

type FoundationPageProps = {
  description: string;
  icon: LucideIcon;
  title: string;
};

export function FoundationPage({ description, icon: Icon, title }: FoundationPageProps) {
  return (
    <AppShell>
      <section className="max-w-2xl">
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
          <Icon aria-hidden="true" size={24} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">{description}</p>
      </section>
      <section className="mt-10 rounded-xl border border-border bg-card p-6 sm:p-8" aria-labelledby="persiapan-title">
        <h2 className="text-lg font-semibold" id="persiapan-title">Belum ada data untuk ditampilkan</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          Halaman ini sudah disiapkan dalam fondasi aplikasi. Data akan tersedia setelah autentikasi dan penyimpanan Supabase diimplementasikan pada tahap berikutnya.
        </p>
      </section>
    </AppShell>
  );
}
