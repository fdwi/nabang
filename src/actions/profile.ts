"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().trim().max(80, "Nama maksimal 80 karakter."),
});

export type ProfileActionState = {
  success?: boolean;
  error?: string;
};

export async function updateDisplayName(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Sesi tidak ditemukan. Silakan masuk kembali." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: parsed.data.displayName })
      .eq("id", user.id);

    if (error) {
      return { error: "Gagal memperbarui nama profil." };
    }

    revalidatePath("/pengaturan");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database belum tersedia." };
  }
}
