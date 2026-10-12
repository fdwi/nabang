import { GoalsView, type GoalWithProgress } from "@/components/goals/goals-view";
import { AppShell } from "@/components/layout/app-shell";
import { calculateGoalProgress } from "@/lib/finance/goal-calculations";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { Target } from "lucide-react";

type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"];
type GoalContribution = Database["public"]["Tables"]["goal_contributions"]["Row"];
type Account = Database["public"]["Tables"]["accounts"]["Row"];

export default async function GoalsPage() {
  let goals: SavingsGoal[] = [];
  let contributions: GoalContribution[] = [];
  let accounts: Account[] = [];
  let isConfigured = true;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [goalsRes, contribRes, accRes] = await Promise.all([
        supabase
          .from("savings_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("goal_contributions")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("accounts")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("name", { ascending: true }),
      ]);

      goals = goalsRes.data || [];
      contributions = contribRes.data || [];
      accounts = accRes.data || [];
    }
  } catch {
    isConfigured = false;
  }

  // Hitung progres untuk setiap target tabungan
  const goalsWithProgress: GoalWithProgress[] = goals.map((goal) => {
    const goalContribs = contributions.filter((c) => c.goal_id === goal.id);
    const progress = calculateGoalProgress(goal, goalContribs);
    return {
      ...goal,
      progress,
    };
  });

  return (
    <AppShell>
      <section className="max-w-2xl">
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
          <Target aria-hidden="true" size={24} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Target Tabungan
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Rencanakan alokasi tabungan masa depan dan pantau persentase progres dari setiap setoran yang Anda lakukan.
        </p>

        {!isConfigured ? (
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            Konfigurasi Supabase belum terhubung di `.env.local`. Pastikan environment variables telah diisi agar data target tersimpan.
          </div>
        ) : null}
      </section>

      <div className="mt-10">
        <GoalsView accounts={accounts} goals={goalsWithProgress} />
      </div>
    </AppShell>
  );
}
