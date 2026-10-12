import { formatRupiah } from "@/lib/formatters/currency";
import { formatDateTimeIndo } from "@/lib/formatters/date";
import type { Database } from "@/types/database";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Account = Database["public"]["Tables"]["accounts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

type RecentTransactionsProps = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
};

export function RecentTransactions({
  accounts,
  categories,
  transactions,
}: RecentTransactionsProps) {
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const recent = transactions.slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Transaksi Terbaru</h2>
        <Link
          className="text-xs font-medium text-[#b34455] hover:underline focus-visible:outline-2 focus-visible:outline-[#b34455] dark:text-[#ffb9c3]"
          href="/transaksi"
        >
          Lihat Semua
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <ReceiptText aria-hidden="true" size={28} />
          <p className="mt-2 text-sm">Belum ada transaksi tercatat.</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {recent.map((tx) => {
            const isIncome = tx.type === "income";
            const isExpense = tx.type === "expense";
            const isTransfer = tx.type === "transfer";

            return (
              <li
                className="flex items-center justify-between py-3 text-sm"
                key={tx.id}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      isIncome
                        ? "bg-[#dcfce7] text-[#166534] dark:bg-[#14532d] dark:text-[#bbf7d0]"
                        : isExpense
                          ? "bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]"
                          : "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft aria-hidden="true" size={16} />
                    ) : isExpense ? (
                      <ArrowUpRight aria-hidden="true" size={16} />
                    ) : (
                      <ArrowRightLeft aria-hidden="true" size={16} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {tx.description ||
                        (isTransfer
                          ? "Transfer Antar Akun"
                          : isIncome
                            ? "Pemasukan"
                            : "Pengeluaran")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isTransfer
                        ? `${accountMap.get(tx.account_id) || "Akun"} -> ${
                            accountMap.get(tx.destination_account_id!) || "Tujuan"
                          }`
                        : `${accountMap.get(tx.account_id) || "Akun"}${
                            tx.category_id
                              ? ` - ${categoryMap.get(tx.category_id)}`
                              : ""
                          }`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-semibold ${
                      isIncome
                        ? "text-[#166534] dark:text-[#86efac]"
                        : isExpense
                          ? "text-[#8f3242] dark:text-[#ffc4cb]"
                          : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {isIncome ? "+" : isExpense ? "-" : ""}
                    {formatRupiah(tx.amount)}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTimeIndo(tx.occurred_at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
