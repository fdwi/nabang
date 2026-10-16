"use server";

import { calculateWarungOrderTotal } from "@/lib/finance/warung";
import { warungOrderSchema, type WarungOrderInput } from "@/lib/validations/warung";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type WarungActionState = {
  error?: string;
  success?: boolean;
};

export async function createWarungOrder(
  data: WarungOrderInput
): Promise<WarungActionState> {
  const parsed = warungOrderSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data pesanan warung tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan. Silakan login kembali." };

    const totalAmount = calculateWarungOrderTotal(parsed.data.items);

    const { error } = await supabase.from("warung_orders").insert({
      user_id: user.id,
      warung_name: parsed.data.warung_name,
      items: parsed.data.items.map((it, idx) => ({
        id: it.id || `item-${Date.now()}-${idx}`,
        name: it.name,
        qty: it.qty,
        price: it.price,
        subtotal: it.qty * it.price,
      })),
      total_amount: totalAmount,
      is_paid: parsed.data.is_paid,
      ordered_at: parsed.data.ordered_at,
      notes: parsed.data.notes || null,
    });

    if (error) return { error: `Gagal menyimpan pesanan: ${error.message}` };

    revalidatePath("/warung");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: `Terjadi kesalahan: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function updateWarungOrder(
  id: string,
  data: WarungOrderInput
): Promise<WarungActionState> {
  const parsed = warungOrderSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data pesanan warung tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan. Silakan login kembali." };

    const totalAmount = calculateWarungOrderTotal(parsed.data.items);

    const { error } = await supabase
      .from("warung_orders")
      .update({
        warung_name: parsed.data.warung_name,
        items: parsed.data.items.map((it, idx) => ({
          id: it.id || `item-${Date.now()}-${idx}`,
          name: it.name,
          qty: it.qty,
          price: it.price,
          subtotal: it.qty * it.price,
        })),
        total_amount: totalAmount,
        is_paid: parsed.data.is_paid,
        ordered_at: parsed.data.ordered_at,
        notes: parsed.data.notes || null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: `Gagal memperbarui pesanan: ${error.message}` };

    revalidatePath("/warung");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: `Terjadi kesalahan: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function toggleWarungPaymentStatus(
  id: string,
  currentStatus: boolean
): Promise<WarungActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan. Silakan login kembali." };

    const { error } = await supabase
      .from("warung_orders")
      .update({ is_paid: !currentStatus })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: `Gagal mengubah status lunas: ${error.message}` };

    revalidatePath("/warung");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: `Terjadi kesalahan: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function deleteWarungOrder(id: string): Promise<WarungActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan. Silakan login kembali." };

    const { error } = await supabase
      .from("warung_orders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: `Gagal menghapus pesanan: ${error.message}` };

    revalidatePath("/warung");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: `Terjadi kesalahan: ${err instanceof Error ? err.message : String(err)}` };
  }
}
