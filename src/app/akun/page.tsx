import { AccountsView } from "@/components/accounts/accounts-view";
import { AppShell } from "@/components/layout/app-shell";
import {
  calculateAccountBalance,
  calculateTotalBalance,
} from "@/lib/finance/calculations";
import { createClient } from "@/lib/supabase/server";
import { WalletCards } from "lucide-react";

import type { Database } from "@/types/database";

type Account = Database["public"]["Tables"]["accounts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Transaction = Pick<
  Database["public"]["Tables"]["transactions"]["Row"],
  "account_id" | "destination_account_id" | "amount" | "type"
>;

export default async function AccountsPage() {
  let accounts: Account[] = [];
  let categories: Category[] = [];
  let transactions: Transaction[] = [];
  let isConfigured = true;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [accRes, catRes, txRes] = await Promise.all([
        supabase
          .from("accounts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("name", { ascending: true }),
        supabase
          .from("transactions")
          .select("account_id, destination_account_id, amount, type")
          .eq("user_id", user.id),
      ]);

      accounts = accRes.data || [];
      categories = catRes.data || [];
      transactions = txRes.data || [];
    }
  } catch {
    isConfigured = false;
  }

  // Hitung saldo berjalan untuk setiap akun
  const accountsWithBalance = accounts.map((acc) => ({
    ...acc,
    currentBalance: calculateAccountBalance(acc, transactions),
  }));

  const totalBalance = calculateTotalBalance(accounts, transactions);

  return (
    <AppShell>
      <section className="max-w-2xl">
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
          <WalletCards aria-hidden="true" size={24} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Akun & Saldo
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Kelola akun tunai, rekening bank, e-wallet, dan pantau saldo berjalan yang dihitung dari riwayat mutasi transaksi.
        </p>

        {!isConfigured ? (
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Konfigurasi Supabase belum terhubung di `.env.local`. Salin `.env.example` ke `.env.local` untuk menyimpan data akun Anda secara persisten.
          </div>
        ) : null}
      </section>

      <div className="mt-10">
        <AccountsView
          accounts={accountsWithBalance}
          categories={categories}
          totalBalance={totalBalance}
        />
      </div>
    </AppShell>
  );
}
