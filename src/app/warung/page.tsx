import { AppShell } from "@/components/layout/app-shell";
import { WarungView } from "@/components/warung/warung-view";
import { createClient } from "@/lib/supabase/server";
import type { WarungOrder } from "@/types/database";
import { UtensilsCrossed } from "lucide-react";

export type WarungAccountOption = {
  id: string;
  name: string;
  account_type: string;
};

export default async function WarungPage() {
  let orders: WarungOrder[] = [];
  let accounts: WarungAccountOption[] = [];
  let isConfigured = true;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Ambil daftar pesanan warung
      const { data, error } = await supabase
        .from("warung_orders")
        .select("*")
        .eq("user_id", user.id)
        .order("ordered_at", { ascending: false });

      if (!error && data) {
        orders = data as WarungOrder[];
      } else if (error) {
        isConfigured = false;
      }

      // Ambil daftar akun aktif untuk pilihan potong saldo otomatis
      const { data: accountsData } = await supabase
        .from("accounts")
        .select("id, name, account_type")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (accountsData) {
        accounts = accountsData;
      }
    }
  } catch {
    isConfigured = false;
  }

  return (
    <AppShell>
      <section className="max-w-2xl">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
          <UtensilsCrossed aria-hidden="true" size={24} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Catatan Warung & Kasbon
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Catat setiap rincian menu pesanan di warteg, warkop, atau kantin agar tidak lupa jumlah, harga satuan, total belanja, serta potong saldo akun otomatis saat lunas.
        </p>
      </section>

      <div className="mt-8">
        <WarungView accounts={accounts} initialOrders={orders} isConfigured={isConfigured} />
      </div>
    </AppShell>
  );
}
