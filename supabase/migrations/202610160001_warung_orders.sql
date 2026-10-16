-- ============================================================================
-- Migration: Warung Orders (Catatan Pembelian & Kasbon Warung)
-- ============================================================================

create table if not exists public.warung_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  warung_name text not null check (length(trim(warung_name)) between 1 and 100),
  items jsonb not null default '[]'::jsonb,
  total_amount numeric(14,2) not null default 0 check (total_amount >= 0),
  is_paid boolean not null default false,
  ordered_at timestamptz not null default now(),
  notes text check (notes is null or length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

-- Trigger updated_at
create trigger warung_orders_updated
  before update on public.warung_orders
  for each row execute procedure public.set_updated_at();

-- Index
create index if not exists warung_orders_user_date_idx on public.warung_orders(user_id, ordered_at desc);
create index if not exists warung_orders_user_paid_idx on public.warung_orders(user_id, is_paid);

-- Row Level Security (RLS)
alter table public.warung_orders enable row level security;

create policy "warung_orders owner" on public.warung_orders
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Grants
revoke all on public.warung_orders from anon;
grant select, insert, update, delete on public.warung_orders to authenticated;
