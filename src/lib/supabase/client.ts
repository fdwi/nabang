"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export function createClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Konfigurasi Supabase belum lengkap.");
  return createBrowserClient<Database>(config.url, config.key);
}
