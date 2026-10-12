-- ============================================================================
-- DwiSave Initial Schema Migration
-- ============================================================================

-- Bersihkan objek lama jika ada percobaan migrasi sebelumnya
drop table if exists public.reminders cascade;
drop table if exists public.budgets cascade;
drop table if exists public.goal_contributions cascade;
drop table if exists public.savings_goals cascade;
drop table if exists public.transactions cascade;
drop table if exists public.categories cascade;
drop table if exists public.accounts cascade;
drop table if exists public.profiles cascade;

drop type if exists public.transaction_type cascade;
drop type if exists public.category_type cascade;
drop type if exists public.goal_status cascade;

-- Tipe data ENUM
create type public.transaction_type as enum ('income', 'expense', 'transfer');
create type public.category_type as enum ('income', 'expense');
create type public.goal_status as enum ('active', 'completed', 'paused', 'cancelled');

-- 1. Tabel Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  currency text not null default 'IDR' check (currency = 'IDR'),
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabel Accounts
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  account_type text not null check (account_type in ('cash', 'bank', 'ewallet', 'other')),
  opening_balance numeric(14,2) not null default 0 check (opening_balance >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

-- 3. Tabel Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  type public.category_type not null,
  color text,
  icon text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (id, user_id, type)
);

-- 4. Tabel Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type public.transaction_type not null,
  amount numeric(14,2) not null check (amount > 0),
  account_id uuid not null references public.accounts(id) on delete cascade,
  destination_account_id uuid references public.accounts(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  description text check (description is null or length(description) <= 500),
  occurred_at timestamptz not null default now(),
  idempotency_key uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, idempotency_key),
  check (
    (type = 'transfer' and destination_account_id is not null and destination_account_id <> account_id and category_id is null)
    or
    (type in ('income', 'expense') and destination_account_id is null and category_id is not null)
  )
);

-- 5. Tabel Savings Goals
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  target_amount numeric(14,2) not null check (target_amount > 0),
  initial_amount numeric(14,2) not null default 0 check (initial_amount >= 0),
  deadline date,
  status public.goal_status not null default 'active',
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

-- 6. Tabel Goal Contributions
create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  goal_id uuid not null references public.savings_goals(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  contribution_type text not null check (contribution_type in ('deposit', 'withdrawal')),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (transaction_id)
);

-- 7. Tabel Budgets
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  limit_amount numeric(14,2) not null check (limit_amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

-- 8. Tabel Reminders
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 100),
  amount numeric(14,2) check (amount is null or amount > 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  reminder_time time not null default '19:00',
  day_of_week smallint check (day_of_week between 0 and 6),
  day_of_month smallint check (day_of_month between 1 and 31),
  next_reminder_at timestamptz,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Function & Trigger Helper
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''))
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger profiles_updated before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger accounts_updated before update on public.accounts
  for each row execute procedure public.set_updated_at();

create trigger categories_updated before update on public.categories
  for each row execute procedure public.set_updated_at();

create trigger transactions_updated before update on public.transactions
  for each row execute procedure public.set_updated_at();

create trigger goals_updated before update on public.savings_goals
  for each row execute procedure public.set_updated_at();

create trigger budgets_updated before update on public.budgets
  for each row execute procedure public.set_updated_at();

-- Indeks Performa
create index transactions_user_date_idx on public.transactions(user_id, occurred_at desc);
create index transactions_account_date_idx on public.transactions(account_id, occurred_at desc);
create index goals_user_status_idx on public.savings_goals(user_id, status);
create index budgets_user_month_idx on public.budgets(user_id, month);
create index reminders_due_idx on public.reminders(next_reminder_at) where is_enabled;

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.savings_goals enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.budgets enable row level security;
alter table public.reminders enable row level security;

create policy "profile owner" on public.profiles
  for all using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "accounts owner" on public.accounts
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "categories owner" on public.categories
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "transactions owner" on public.transactions
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "goals owner" on public.savings_goals
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "contributions owner" on public.goal_contributions
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "budgets owner" on public.budgets
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "reminders owner" on public.reminders
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Izin Hak Akses Role
revoke all on public.profiles, public.accounts, public.categories, public.transactions,
  public.savings_goals, public.goal_contributions, public.budgets, public.reminders from anon;

grant select, insert, update, delete on public.profiles, public.accounts, public.categories, public.transactions,
  public.savings_goals, public.goal_contributions, public.budgets, public.reminders to authenticated;
