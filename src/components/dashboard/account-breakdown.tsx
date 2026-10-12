import { formatRupiah } from "@/lib/formatters/currency";
import type { Database } from "@/types/database";
import { Banknote, Building2, CreditCard, Wallet } from "lucide-react";
import Link from "next/link";

type Account = Database["public"]["Tables"]["accounts"]["Row"] & {
  currentBalance: number;
};

type AccountBreakdownProps = {
  accounts: Account[];
  totalBalance: number;
};

export function AccountBreakdown({ accounts, totalBalance }: AccountBreakdownProps) {
  const activeAccounts = accounts.filter((a) => a.is_active);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Building2 aria-hidden="true" size={16} />;
      case "cash":
        return <Banknote aria-hidden="true" size={16} />;
      case "ewallet":
        return <CreditCard aria-hidden="true" size={16} />;
      default:
        return <Wallet aria-hidden="true" size={16} />;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Alokasi Saldo Akun</h2>
        <Link
          className="text-xs font-medium text-[#b34455] hover:underline focus-visible:outline-2 focus-visible:outline-[#b34455] dark:text-[#ffb9c3]"
          href="/akun"
        >
          Kelola Akun
        </Link>
      </div>

      {activeAccounts.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <Wallet aria-hidden="true" size={28} />
          <p className="mt-2 text-sm">Belum ada akun keuangan aktif.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {activeAccounts.map((acc) => {
            const percentage =
              totalBalance > 0
                ? Math.round((Math.max(0, acc.currentBalance) / totalBalance) * 100)
                : 0;

            return (
              <div className="space-y-1.5" key={acc.id}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {getAccountIcon(acc.account_type)}
                    </span>
                    <span className="font-medium text-foreground">{acc.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatRupiah(acc.currentBalance)}
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[#b34455] dark:bg-[#ffb9c3]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
