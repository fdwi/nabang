"use server";

import { loginSchema } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type LoginState = { error?: string };

export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data login tidak valid." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return { error: "Email atau kata sandi salah. Periksa kembali dan pastikan akun sudah terdaftar di Supabase." };
      }
      if (error.message.includes("Email logins are disabled")) {
        return { error: "Login email belum diaktifkan di Supabase. Buka Supabase Dashboard > Authentication > Providers > Email, lalu aktifkan toggle 'Enable Email provider'." };
      }
      if (error.message.includes("Email not confirmed")) {
        return { error: "Email belum dikonfirmasi di Supabase. Buka menu Authentication > Users di Supabase, lalu klik user Anda dan pilih 'Auto Confirm'." };
      }
      return { error: `Gagal login: ${error.message}` };
    }
  } catch {
    return { error: "Konfigurasi Supabase belum siap. Lengkapi environment variables terlebih dahulu." };
  }

  redirect("/dashboard");
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika client belum terkonfigurasi, tetap alihkan ke login
  }
  redirect("/login");
}
