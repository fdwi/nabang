import { AppShell } from "@/components/layout/app-shell";
import { TransactionsView } from "@/components/transactions/transactions-view";
import { createClient } from "@/lib/supabase/server";
import { ReceiptText } from "lucide-react";

import type { Database } from "@/types/database";

type Account = Database["public"]["Tables"]["accounts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export default async function TransactionsPage() {
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
          .order("name", { ascending: true }),
        supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("name", { ascending: true }),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("occurred_at", { ascending: false }),
      ]);

      accounts = accRes.data || [];
      categories = catRes.data || [];
      transactions = txRes.data || [];
    }
  } catch {
    isConfigured = false;
  }

  return (
    <AppShell>
      <section className="max-w-2xl">
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
          <ReceiptText aria-hidden="true" size={24} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Transaksi</h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Catat pemasukan, pengeluaran, dan transfer antar-akun dengan riwayat mutasi yang konsisten dan dapat diekspor.
        </p>

        {!isConfigured ? (
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Konfigurasi Supabase belum terhubung di `.env.local`. Pastikan environment variable telah diisi agar transaksi tersimpan ke database Anda.
          </div>
        ) : null}
      </section>

      <div className="mt-10">
        <TransactionsView
          accounts={accounts}
          categories={categories}
          transactions={transactions}
        />
      </div>
    </AppShell>
  );
}
