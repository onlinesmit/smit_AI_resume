-- ==============================================================================
-- SUPABASE RESUME BUILDER DATABASE SCHEMA
-- Run this script in your Supabase project's SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- 1. Create resumes table
create table if not exists public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'My Resume',
  template text not null default 'plain', -- 'plain' or 'attractive'
  accent_color text not null default '#2563eb',
  data jsonb not null default '{}'::jsonb,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create index on user_id for fast queries
create index if not exists idx_resumes_user_id on public.resumes(user_id);
create index if not exists idx_resumes_updated_at on public.resumes(updated_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.resumes enable row level security;

-- 4. Set up security policies
-- Allow users to read their own resumes, or any public resume
drop policy if exists "Users can view own or public resumes" on public.resumes;
create policy "Users can view own or public resumes"
  on public.resumes for select
  using (auth.uid() = user_id or is_public = true);

-- Allow authenticated users to insert resumes owned by them
drop policy if exists "Users can insert own resumes" on public.resumes;
create policy "Users can insert own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own resumes
drop policy if exists "Users can update own resumes" on public.resumes;
create policy "Users can update own resumes"
  on public.resumes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow users to delete their own resumes
drop policy if exists "Users can delete own resumes" on public.resumes;
create policy "Users can delete own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- 5. Automatically update 'updated_at' column timestamp on update
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_resumes_updated_at on public.resumes;
create trigger set_resumes_updated_at
  before update on public.resumes
  for each row
  execute procedure public.handle_updated_at();

-- Schema setup complete!
