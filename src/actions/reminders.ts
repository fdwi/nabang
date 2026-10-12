"use server";

import { reminderSchema } from "@/lib/validations/reminders";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ReminderActionState = {
  error?: string;
  success?: boolean;
};

export async function createReminder(
  _prevState: ReminderActionState,
  formData: FormData
): Promise<ReminderActionState> {
  const parsed = reminderSchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount") || null,
    frequency: formData.get("frequency"),
    reminder_time: formData.get("reminder_time") || "19:00",
    day_of_week: formData.get("day_of_week") || null,
    day_of_month: formData.get("day_of_month") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data pengingat tidak valid." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan. Silakan login kembali." };

    // Hitung waktu pengingat berikutnya secara sederhana
    const [hours, minutes] = parsed.data.reminder_time.split(":").map(Number);
    const nextDate = new Date();
    nextDate.setHours(hours, minutes, 0, 0);
    if (nextDate <= new Date()) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    const { error } = await supabase.from("reminders").insert({
      user_id: user.id,
      title: parsed.data.title,
      amount: parsed.data.amount,
      frequency: parsed.data.frequency,
      reminder_time: `${parsed.data.reminder_time}:00`,
      day_of_week: parsed.data.day_of_week,
      day_of_month: parsed.data.day_of_month,
      next_reminder_at: nextDate.toISOString(),
      is_enabled: true,
    });

    if (error) return { error: `Gagal membuat pengingat: ${error.message}` };

    revalidatePath("/pengingat");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}

export async function toggleReminderStatus(
  reminderId: string,
  currentStatus: boolean
): Promise<ReminderActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    const { error } = await supabase
      .from("reminders")
      .update({ is_enabled: !currentStatus })
      .eq("id", reminderId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/pengingat");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}

export async function deleteReminder(reminderId: string): Promise<ReminderActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Sesi tidak ditemukan." };

    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", reminderId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/pengingat");
    return { success: true };
  } catch {
    return { error: "Koneksi ke database gagal." };
  }
}
