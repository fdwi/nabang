"use server";

import { accountSchema } from "@/lib/validations/finance";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AccountActionState = {
  error?: string;
  success?: boolean;
};

export async function createAccount(
  _prevState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    account_type: formData.get("account_type"),
    opening_balance: formData.get("opening_balance"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data akun tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan. Silakan login kembali." };

    const { error } = await supabase.from("accounts").insert({
      user_id: user.id,
      name: parsed.data.name,
      account_type: parsed.data.account_type,
      opening_balance: parsed.data.opening_balance,
      is_active: true,
    });

    if (error) return { error: `Gagal membuat akun: ${error.message}` };

    revalidatePath("/akun");
    revalidatePath("/dashboard");
    revalidatePath("/transaksi");
    return { success: true };
  } catch {
    return { error: "Koneksi Supabase belum siap. Lengkapi .env.local terlebih dahulu." };
  }
}

export async function updateAccount(
  accountId: string,
  _prevState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    account_type: formData.get("account_type"),
    opening_balance: formData.get("opening_balance"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data akun tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    const { error } = await supabase
      .from("accounts")
      .update({
        name: parsed.data.name,
        account_type: parsed.data.account_type,
        opening_balance: parsed.data.opening_balance,
      })
      .eq("id", accountId)
      .eq("user_id", user.id);

    if (error) return { error: `Gagal memperbarui akun: ${error.message}` };

    revalidatePath("/akun");
    revalidatePath("/dashboard");
    revalidatePath("/transaksi");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}

export async function toggleAccountStatus(
  accountId: string,
  currentStatus: boolean
): Promise<AccountActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    const { error } = await supabase
      .from("accounts")
      .update({ is_active: !currentStatus })
      .eq("id", accountId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/akun");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}

export async function deleteAccount(accountId: string): Promise<AccountActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    // Cek apakah akun memiliki transaksi yang terkait
    const { count: txCount, error: countError } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .or(`account_id.eq.${accountId},destination_account_id.eq.${accountId}`);

    if (countError) return { error: countError.message };

    if (txCount && txCount > 0) {
      return {
        error:
          "Akun ini memiliki riwayat transaksi dan tidak dapat dihapus. Anda dapat menonaktifkannya agar tidak muncul pada pilihan transaksi baru.",
      };
    }

    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", accountId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/akun");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}
