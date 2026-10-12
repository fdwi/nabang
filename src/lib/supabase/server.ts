import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export async function createClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Konfigurasi Supabase belum lengkap.");
  const cookieStore = await cookies();
  return createServerClient<Database>(config.url, config.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot persist refreshed auth cookies.
        }
      },
    },
  });
}
