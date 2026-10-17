"use server";

import { calculateWarungOrderTotal } from "@/lib/finance/warung";
import { warungOrderSchema, type WarungOrderInput } from "@/lib/validations/warung";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type WarungActionState = {
  error?: string;
  success?: boolean;
};

// Helper untuk mencari kategori pengeluaran makanan jika tersedia
async function findFoodCategoryId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "expense")
      .ilike("name", "%makan%")
      .limit(1)
      .maybeSingle();

    return data?.id ?? null;
  } catch {
    return null;
  }
}

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
    const itemsSummary = parsed.data.items.map((i) => `${i.qty}x ${i.name}`).join(", ");
    let transactionId: string | null = null;

    // Jika lunas dan dipilih auto potong saldo akun aktif
    if (parsed.data.is_paid && parsed.data.auto_deduct && parsed.data.account_id) {
      // Pastikan akun aktif
      const { data: acc } = await supabase
        .from("accounts")
        .select("id, is_active")
        .eq("id", parsed.data.account_id)
        .eq("user_id", user.id)
        .single();

      if (acc && acc.is_active) {
        const categoryId = await findFoodCategoryId(supabase, user.id);
        const { data: tx, error: txError } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            type: "expense",
            amount: totalAmount,
            account_id: parsed.data.account_id,
            category_id: categoryId,
            description: `Warung: ${parsed.data.warung_name} (${itemsSummary.slice(0, 150)})`,
            occurred_at: new Date(parsed.data.ordered_at).toISOString(),
          })
          .select("id")
          .single();

        if (!txError && tx) {
          transactionId = tx.id;
        }
      }
    }

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
      account_id: parsed.data.account_id || null,
      transaction_id: transactionId,
      ordered_at: parsed.data.ordered_at,
      notes: parsed.data.notes || null,
    });

    if (error) return { error: `Gagal menyimpan pesanan: ${error.message}` };

    revalidatePath("/warung");
    revalidatePath("/akun");
    revalidatePath("/transaksi");
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

    // Cek pesanan lama
    const { data: existingOrder } = await supabase
      .from("warung_orders")
      .select("id, transaction_id, account_id, is_paid")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    const totalAmount = calculateWarungOrderTotal(parsed.data.items);
    const itemsSummary = parsed.data.items.map((i) => `${i.qty}x ${i.name}`).join(", ");
    let transactionId = existingOrder?.transaction_id || null;

    if (parsed.data.is_paid && parsed.data.auto_deduct && parsed.data.account_id) {
      const categoryId = await findFoodCategoryId(supabase, user.id);
      if (transactionId) {
        // Update transaksi yang sudah ada
        await supabase
          .from("transactions")
          .update({
            amount: totalAmount,
            account_id: parsed.data.account_id,
            description: `Warung: ${parsed.data.warung_name} (${itemsSummary.slice(0, 150)})`,
            occurred_at: new Date(parsed.data.ordered_at).toISOString(),
          })
          .eq("id", transactionId)
          .eq("user_id", user.id);
      } else {
        // Buat transaksi baru
        const { data: tx } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            type: "expense",
            amount: totalAmount,
            account_id: parsed.data.account_id,
            category_id: categoryId,
            description: `Warung: ${parsed.data.warung_name} (${itemsSummary.slice(0, 150)})`,
            occurred_at: new Date(parsed.data.ordered_at).toISOString(),
          })
          .select("id")
          .single();
        if (tx) transactionId = tx.id;
      }
    } else if (!parsed.data.is_paid && transactionId) {
      // Jika diubah jadi belum lunas (kasbon), hapus transaksi pemotongan saldo sebelumnya
      await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId)
        .eq("user_id", user.id);
      transactionId = null;
    }

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
        account_id: parsed.data.account_id || null,
        transaction_id: transactionId,
        ordered_at: parsed.data.ordered_at,
        notes: parsed.data.notes || null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: `Gagal memperbarui pesanan: ${error.message}` };

    revalidatePath("/warung");
    revalidatePath("/akun");
    revalidatePath("/transaksi");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: `Terjadi kesalahan: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function toggleWarungPaymentStatus(
  id: string,
  currentStatus: boolean,
  accountId?: string | null
): Promise<WarungActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan. Silakan login kembali." };

    const nextPaidStatus = !currentStatus;

    // Ambil order saat ini
    const { data: order } = await supabase
      .from("warung_orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!order) return { error: "Pesanan warung tidak ditemukan." };

    let transactionId = order.transaction_id;

    if (nextPaidStatus) {
      // Mengubah menjadi LUNAS
      const targetAccountId = accountId || order.account_id;
      if (targetAccountId && !transactionId) {
        // Otomatis potong saldo jika akun dipilih
        const itemsList = Array.isArray(order.items) ? (order.items as { qty: number; name: string }[]) : [];
        const itemsSummary = itemsList.map((i) => `${i.qty}x ${i.name}`).join(", ");
        const categoryId = await findFoodCategoryId(supabase, user.id);

        const { data: tx } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            type: "expense",
            amount: order.total_amount,
            account_id: targetAccountId,
            category_id: categoryId,
            description: `Warung: ${order.warung_name} (${itemsSummary.slice(0, 150)})`,
            occurred_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (tx) transactionId = tx.id;
      }
    } else {
      // Mengubah menjadi KASBON (belum lunas)
      if (transactionId) {
        // Hapus transaksi pemotongan saldo sebelumnya
        await supabase
          .from("transactions")
          .delete()
          .eq("id", transactionId)
          .eq("user_id", user.id);
        transactionId = null;
      }
    }

    const { error } = await supabase
      .from("warung_orders")
      .update({
        is_paid: nextPaidStatus,
        account_id: accountId || order.account_id,
        transaction_id: transactionId,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: `Gagal mengubah status lunas: ${error.message}` };

    revalidatePath("/warung");
    revalidatePath("/akun");
    revalidatePath("/transaksi");
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

    // Cek apakah ada transaksi pemotongan saldo yang terkait
    const { data: order } = await supabase
      .from("warung_orders")
      .select("transaction_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (order?.transaction_id) {
      await supabase
        .from("transactions")
        .delete()
        .eq("id", order.transaction_id)
        .eq("user_id", user.id);
    }

    const { error } = await supabase
      .from("warung_orders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: `Gagal menghapus pesanan: ${error.message}` };

    revalidatePath("/warung");
    revalidatePath("/akun");
    revalidatePath("/transaksi");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: `Terjadi kesalahan: ${err instanceof Error ? err.message : String(err)}` };
  }
}
