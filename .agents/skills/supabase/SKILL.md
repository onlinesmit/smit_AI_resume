---
name: supabase
description: >-
  Official Supabase development skill. Guides schema design, Row Level Security (RLS) policies,
  PostgreSQL database queries, Supabase Auth, Storage, Realtime, and Edge Functions.
---

# Supabase Developer Skill

## Overview
This skill provides best practices, conventions, and procedures for building and managing Supabase backends.

## 1. Database & Table Design
- Use `uuid` for primary keys: `id uuid default gen_random_uuid() primary key`.
- Set timestamps with time zone:
  ```sql
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  ```
- Always link user data to `auth.users(id)`:
  ```sql
  user_id uuid references auth.users(id) on delete cascade not null
  ```

## 2. Row Level Security (RLS)
Always enable RLS on every table:
```sql
alter table public.<table_name> enable row level security;
```

Standard User CRUD Policies:
```sql
-- Select own records
create policy "Users can view own data"
  on public.<table_name> for select
  using (auth.uid() = user_id);

-- Insert own records
create policy "Users can insert own data"
  on public.<table_name> for insert
  with check (auth.uid() = user_id);

-- Update own records
create policy "Users can update own data"
  on public.<table_name> for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Delete own records
create policy "Users can delete own data"
  on public.<table_name> for delete
  using (auth.uid() = user_id);
```

## 3. Client SDK Usage (`@supabase/supabase-js`)
- Initialize client:
  ```javascript
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  ```
- Authentication:
  ```javascript
  const { data, error } = await supabase.auth.signUp({ email, password })
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  const { error } = await supabase.auth.signOut()
  ```
- Querying data:
  ```javascript
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('updated_at', { ascending: false })
  ```
