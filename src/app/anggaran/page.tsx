import { BudgetsView, type BudgetWithUsage } from "@/components/budgets/budgets-view";
import { AppShell } from "@/components/layout/app-shell";
import { calculateBudgetUsage } from "@/lib/finance/goal-calculations";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { PiggyBank } from "lucide-react";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Budget = Database["public"]["Tables"]["budgets"]["Row"];
type Transaction = Pick<
  Database["public"]["Tables"]["transactions"]["Row"],
  "amount" | "category_id" | "occurred_at" | "type"
>;

export default async function BudgetsPage() {
  let budgets: Budget[] = [];
  let categories: Category[] = [];
  let transactions: Transaction[] = [];
  let isConfigured = true;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [budgetsRes, catRes, txRes] = await Promise.all([
        supabase
          .from("budgets")
          .select("*")
          .eq("user_id", user.id)
          .order("month", { ascending: false }),
        supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("name", { ascending: true }),
        supabase
          .from("transactions")
          .select("amount, category_id, occurred_at, type")
          .eq("user_id", user.id)
          .eq("type", "expense"),
      ]);

      budgets = budgetsRes.data || [];
      categories = catRes.data || [];
      transactions = txRes.data || [];
    }
  } catch {
    isConfigured = false;
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Hitung penggunaan anggaran untuk setiap kategori
  const allBudgetsWithUsage: BudgetWithUsage[] = budgets.map((b) => {
    const usage = calculateBudgetUsage(b, transactions);
    return {
      ...b,
      categoryName: categoryMap.get(b.category_id) || "Kategori",
      usage,
    };
  });

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <AppShell>
      <section className="max-w-2xl">
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
          <PiggyBank aria-hidden="true" size={24} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Anggaran Bulanan
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Kendalikan pengeluaran bulanan Anda per kategori dengan batas anggaran yang transparan dan sistem peringatan otomatis.
        </p>

        {!isConfigured ? (
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Konfigurasi Supabase belum terhubung di `.env.local`. Pastikan environment variables telah diisi agar batas anggaran tersimpan.
          </div>
        ) : null}
      </section>

      <div className="mt-10">
        <BudgetsView
          allBudgets={allBudgetsWithUsage}
          categories={categories}
          initialMonth={currentMonthStr}
        />
      </div>
    </AppShell>
  );
}
