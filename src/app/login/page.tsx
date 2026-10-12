import { LoginForm } from "@/components/auth/login-form";
import { getSupabaseConfig } from "@/lib/supabase/env";

export default function LoginPage() {
  return <LoginForm configured={Boolean(getSupabaseConfig())} />;
}
