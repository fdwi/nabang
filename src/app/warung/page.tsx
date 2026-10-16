import { AppShell } from "@/components/layout/app-shell";
import { WarungView } from "@/components/warung/warung-view";
import Shuffle from "@/components/ui/shuffle";
import { createClient } from "@/lib/supabase/server";
import type { WarungOrder } from "@/types/database";
import { UtensilsCrossed } from "lucide-react";

export default async function WarungPage() {
  let orders: WarungOrder[] = [];
  let isConfigured = true;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("warung_orders")
        .select("*")
        .eq("user_id", user.id)
        .order("ordered_at", { ascending: false });

      if (!error && data) {
        orders = data as WarungOrder[];
      }
    }
  } catch {
    isConfigured = false;
  }

  return (
    <AppShell>
      <section className="max-w-2xl">
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-[#f9e1e1] text-[#8f3242] dark:bg-[#542d35] dark:text-[#ffc4cb]">
          <UtensilsCrossed aria-hidden="true" size={24} />
        </div>
        <Shuffle
          animationMode="evenodd"
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
          duration={0.35}
          ease="power3.out"
          respectReducedMotion={true}
          shuffleDirection="right"
          shuffleTimes={1}
          stagger={0.03}
          tag="h1"
          text="Catatan Warung & Kasbon"
          textAlign="left"
          threshold={0.1}
          triggerOnce={true}
          triggerOnHover={true}
        />
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Catat setiap rincian menu pesanan di warteg, warkop, atau kantin agar tidak lupa jumlah, harga satuan, total belanja, dan status lunasnya.
        </p>
      </section>

      <div className="mt-10">
        <WarungView initialOrders={orders} isConfigured={isConfigured} />
      </div>
    </AppShell>
  );
}
