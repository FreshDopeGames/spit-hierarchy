-- Create rapper_suggestions table
create table public.rapper_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  rapper_name text not null,
  additional_info text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.rapper_suggestions enable row level security;

-- RLS Policies
create policy "Users can view their own suggestions"
  on public.rapper_suggestions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own suggestions"
  on public.rapper_suggestions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Admins can view all suggestions"
  on public.rapper_suggestions
  for select
  to authenticated
  using (is_admin());

create policy "Admins can update suggestions"
  on public.rapper_suggestions
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

-- Indexes for performance
create index rapper_suggestions_user_id_idx on public.rapper_suggestions(user_id);
create index rapper_suggestions_status_idx on public.rapper_suggestions(status);
create index rapper_suggestions_created_at_idx on public.rapper_suggestions(created_at desc);

-- Updated_at trigger
create trigger update_rapper_suggestions_updated_at
  before update on public.rapper_suggestions
  for each row
  execute function public.update_updated_at_column();