"use client";

import { BrandLogo } from "@/components/brand-logo";
import {
  Bell,
  ChartNoAxesCombined,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  Settings,
  Target,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transaksi", label: "Transaksi", icon: ReceiptText },
  { href: "/akun", label: "Akun & Saldo", icon: WalletCards },
  { href: "/target", label: "Target Tabungan", icon: Target },
  { href: "/anggaran", label: "Anggaran", icon: PiggyBank },
  { href: "/laporan", label: "Laporan", icon: ChartNoAxesCombined },
  { href: "/pengingat", label: "Pengingat", icon: Bell },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar ala Livin' Banking */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-20 items-center px-6">
          <BrandLogo className="text-[#b34455]" />
        </div>
        <nav aria-label="Navigasi utama" className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navigation.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455] ${
                  isActive
                    ? "bg-gradient-to-r from-pink-100 to-rose-50 font-semibold text-[#8f3242] shadow-xs dark:from-[#542d35] dark:to-[#401f25] dark:text-[#ffc4cb]"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
                href={href}
                key={href}
              >
                <Icon
                  aria-hidden="true"
                  className={isActive ? "text-[#b34455] dark:text-[#ffb9c3]" : "text-muted-foreground"}
                  size={19}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation ala Livin' Banking */}
      <nav
        aria-label="Navigasi mobile"
        className="fixed inset-x-0 bottom-0 z-20 flex h-[calc(4.5rem+env(safe-area-inset-bottom))] items-start justify-around border-t border-border/80 bg-card/95 px-2 pt-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        {navigation.slice(0, 5).map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b34455] ${
                isActive
                  ? "font-bold text-[#b34455] dark:text-[#ffb9c3]"
                  : "font-medium text-muted-foreground hover:text-foreground"
              }`}
              href={href}
              key={href}
            >
              <div
                className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? "bg-pink-100 dark:bg-pink-950/80"
                    : "bg-transparent"
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={isActive ? "text-[#b34455] dark:text-[#ffb9c3]" : "text-muted-foreground"}
                  size={18}
                />
              </div>
              <span className="leading-none">
                {label === "Target Tabungan" ? "Target" : label === "Akun & Saldo" ? "Akun" : label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
