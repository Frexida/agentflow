-- designs table: stores organization designs per user
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'Untitled',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: users can only access their own designs
alter table public.designs enable row level security;

create policy "Users can view own designs"
  on public.designs for select
  using (auth.uid() = user_id);

create policy "Users can insert own designs"
  on public.designs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own designs"
  on public.designs for update
  using (auth.uid() = user_id);

create policy "Users can delete own designs"
  on public.designs for delete
  using (auth.uid() = user_id);

-- subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Index for fast lookups
create index if not exists idx_designs_user_id on public.designs(user_id);
create index if not exists idx_designs_updated on public.designs(updated_at desc);
