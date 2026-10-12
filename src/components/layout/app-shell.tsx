import { AppNavigation } from "@/components/layout/app-navigation";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Settings } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground lg:flex">
      <AppNavigation />
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo className="text-[#b34455] lg:hidden" compact />
            <p className="text-sm text-muted-foreground">Keuangan pribadi Anda</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              aria-label="Buka halaman pengaturan"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455] dark:focus-visible:outline-[#ffb9c3] lg:hidden"
              href="/pengaturan"
            >
              <Settings aria-hidden="true" size={19} />
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}

