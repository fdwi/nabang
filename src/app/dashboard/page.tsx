import { DashboardView } from "@/components/dashboard/dashboard-view";
import { AppShell } from "@/components/layout/app-shell";
import {
  calculateAccountBalance,
  calculateTotalBalance,
} from "@/lib/finance/calculations";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Account = Database["public"]["Tables"]["accounts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export default async function DashboardPage() {
  let accounts: Account[] = [];
  let categories: Category[] = [];
  let transactions: Transaction[] = [];
  let displayName = "Pemilik";
  let monthlyBudget: number | null = null;
  let isConfigured = true;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const [accRes, catRes, txRes, profRes, budRes] = await Promise.all([
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
          .select("*")
          .eq("user_id", user.id)
          .order("occurred_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("budgets")
          .select("limit_amount, month")
          .eq("user_id", user.id)
          .eq("month", currentMonthStr),
      ]);

      accounts = accRes.data || [];
      categories = catRes.data || [];
      transactions = txRes.data || [];
      displayName =
        profRes.data?.display_name ||
        user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "Pemilik";

      const totalMonthlyBudget = (budRes.data || []).reduce(
        (sum, b) => sum + (Number(b.limit_amount) || 0),
        0
      );
      monthlyBudget = totalMonthlyBudget > 0 ? totalMonthlyBudget : null;
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
      {!isConfigured ? (
        <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900/50">
          Konfigurasi Supabase belum terhubung di `.env.local`. Salin `.env.example` ke `.env.local` untuk menyimpan dan memuat data keuangan Anda.
        </div>
      ) : null}

      <DashboardView
        accounts={accountsWithBalance}
        categories={categories}
        displayName={displayName}
        monthlyBudget={monthlyBudget}
        totalBalance={totalBalance}
        transactions={transactions}
      />
    </AppShell>
  );
}
