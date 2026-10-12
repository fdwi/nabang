"use server";

import { budgetSchema } from "@/lib/validations/budgets";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type BudgetActionState = {
  error?: string;
  success?: boolean;
};

export async function createOrUpdateBudget(
  _prevState: BudgetActionState,
  formData: FormData
): Promise<BudgetActionState> {
  const parsed = budgetSchema.safeParse({
    category_id: formData.get("category_id"),
    month: formData.get("month"),
    limit_amount: formData.get("limit_amount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data anggaran tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan. Silakan login kembali." };

    const { error } = await supabase.from("budgets").upsert(
      {
        user_id: user.id,
        category_id: parsed.data.category_id,
        month: parsed.data.month,
        limit_amount: parsed.data.limit_amount,
      },
      { onConflict: "user_id, category_id, month" }
    );

    if (error) return { error: `Gagal menyimpan anggaran: ${error.message}` };

    revalidatePath("/anggaran");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}

export async function deleteBudget(budgetId: string): Promise<BudgetActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", budgetId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/anggaran");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}
