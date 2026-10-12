"use server";

import { contributionSchema, goalSchema } from "@/lib/validations/goals";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type GoalActionState = {
  error?: string;
  success?: boolean;
};

export async function createGoal(
  _prevState: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const parsed = goalSchema.safeParse({
    name: formData.get("name"),
    target_amount: formData.get("target_amount"),
    initial_amount: formData.get("initial_amount") || 0,
    deadline: formData.get("deadline") || null,
    color: formData.get("color") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data target tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan. Silakan login kembali." };

    const { error } = await supabase.from("savings_goals").insert({
      user_id: user.id,
      name: parsed.data.name,
      target_amount: parsed.data.target_amount,
      initial_amount: parsed.data.initial_amount,
      deadline: parsed.data.deadline || null,
      color: parsed.data.color || null,
      status: "active",
    });

    if (error) return { error: `Gagal membuat target: ${error.message}` };

    revalidatePath("/target");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}

export async function createGoalContribution(
  _prevState: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const parsed = contributionSchema.safeParse({
    goal_id: formData.get("goal_id"),
    amount: formData.get("amount"),
    contribution_type: formData.get("contribution_type"),
    account_id: formData.get("account_id") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data kontribusi tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    let transactionId: string | null = null;

    // Jika akun sumber dipilih, buat transaksi mutasi terkait agar saldo akun konsisten
    if (parsed.data.account_id) {
      const isDeposit = parsed.data.contribution_type === "deposit";

      // Cari atau gunakan kategori penyesuaian tabungan jika ada
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", isDeposit ? "expense" : "income")
        .limit(1)
        .maybeSingle();

      const { data: tx, error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: isDeposit ? "expense" : "income",
          amount: parsed.data.amount,
          account_id: parsed.data.account_id,
          category_id: category?.id || null,
          description: isDeposit
            ? "Setoran tabungan target"
            : "Penarikan tabungan target",
          occurred_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (txError) {
        return { error: `Gagal mencatat mutasi akun: ${txError.message}` };
      }
      transactionId = tx.id;
    }

    // Catat ke goal_contributions
    const { error: contribError } = await supabase
      .from("goal_contributions")
      .insert({
        user_id: user.id,
        goal_id: parsed.data.goal_id,
        amount: parsed.data.amount,
        contribution_type: parsed.data.contribution_type,
        transaction_id: transactionId,
      });

    if (contribError) {
      return { error: `Gagal mencatat kontribusi: ${contribError.message}` };
    }

    revalidatePath("/target");
    revalidatePath("/akun");
    revalidatePath("/dashboard");
    revalidatePath("/transaksi");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}

export async function updateGoalStatus(
  goalId: string,
  status: "active" | "completed" | "paused" | "cancelled"
): Promise<GoalActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    const { error } = await supabase
      .from("savings_goals")
      .update({ status })
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/target");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}

export async function deleteGoal(goalId: string): Promise<GoalActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    // Hapus kontribusi terkait terlebih dahulu
    await supabase
      .from("goal_contributions")
      .delete()
      .eq("goal_id", goalId)
      .eq("user_id", user.id);

    const { error } = await supabase
      .from("savings_goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/target");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}
