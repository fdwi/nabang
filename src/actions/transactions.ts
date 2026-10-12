"use server";

import { transactionSchema } from "@/lib/validations/finance";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TransactionActionState = {
  error?: string;
  success?: boolean;
};

export async function createTransaction(
  _prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const parsed = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    account_id: formData.get("account_id"),
    destination_account_id: formData.get("destination_account_id") || null,
    category_id: formData.get("category_id") || null,
    description: formData.get("description") || null,
    occurred_at: formData.get("occurred_at"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan. Silakan login kembali." };

    // Pastikan akun sumber aktif
    const { data: sourceAcc, error: accError } = await supabase
      .from("accounts")
      .select("id, is_active")
      .eq("id", parsed.data.account_id)
      .eq("user_id", user.id)
      .single();

    if (accError || !sourceAcc) {
      return { error: "Akun sumber tidak valid atau bukan milik Anda." };
    }

    if (!sourceAcc.is_active) {
      return { error: "Akun sumber sedang nonaktif. Aktifkan akun terlebih dahulu." };
    }

    // Jika transfer, pastikan akun tujuan aktif
    if (parsed.data.type === "transfer" && parsed.data.destination_account_id) {
      const { data: destAcc, error: destError } = await supabase
        .from("accounts")
        .select("id, is_active")
        .eq("id", parsed.data.destination_account_id)
        .eq("user_id", user.id)
        .single();

      if (destError || !destAcc) {
        return { error: "Akun tujuan transfer tidak valid." };
      }

      if (!destAcc.is_active) {
        return { error: "Akun tujuan transfer sedang nonaktif." };
      }
    }

    // Simpan transaksi
    const { error: insertError } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: parsed.data.type,
      amount: parsed.data.amount,
      account_id: parsed.data.account_id,
      destination_account_id:
        parsed.data.type === "transfer" ? parsed.data.destination_account_id : null,
      category_id:
        parsed.data.type !== "transfer" ? parsed.data.category_id : null,
      description: parsed.data.description || null,
      occurred_at: new Date(parsed.data.occurred_at).toISOString(),
    });

    if (insertError) {
      return { error: `Gagal menyimpan transaksi: ${insertError.message}` };
    }

    revalidatePath("/transaksi");
    revalidatePath("/akun");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal. Pastikan .env.local telah dikonfigurasi." };
  }
}

export async function deleteTransaction(
  transactionId: string
): Promise<TransactionActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/transaksi");
    revalidatePath("/akun");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}
