-- SHEDRACK WAEMA STORES - SUPABASE DATABASE
-- Run this entire script in Supabase SQL Editor.

create table if not exists public.store_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  products jsonb not null default '[]'::jsonb,
  customers jsonb not null default '[]'::jsonb,
  sales jsonb not null default '[]'::jsonb,
  invoices jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.store_data enable row level security;

create policy "Users can read their own store data"
on public.store_data for select
using (auth.uid() = user_id);

create policy "Users can insert their own store data"
on public.store_data for insert
with check (auth.uid() = user_id);

create policy "Users can update their own store data"
on public.store_data for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists store_data_updated_at_idx on public.store_data(updated_at desc);
