"use server";

import { categorySchema } from "@/lib/validations/finance";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CategoryActionState = {
  error?: string;
  success?: boolean;
};

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color"),
    icon: formData.get("icon"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    const { error } = await supabase.from("categories").insert({
      user_id: user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color || null,
      icon: parsed.data.icon || null,
      is_archived: false,
    });

    if (error) return { error: `Gagal membuat kategori: ${error.message}` };

    revalidatePath("/akun");
    revalidatePath("/transaksi");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}

export async function toggleArchiveCategory(
  categoryId: string,
  currentArchived: boolean
): Promise<CategoryActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    const { error } = await supabase
      .from("categories")
      .update({ is_archived: !currentArchived })
      .eq("id", categoryId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/akun");
    revalidatePath("/transaksi");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}
