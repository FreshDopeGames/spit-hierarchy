
-- Create atomic onboarding RPC
create or replace function public.complete_onboarding(
  p_username text,
  p_rapper_names text[]
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_rapper_id uuid;
  v_position int := 0;
  i int;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Upsert profile with username
  insert into profiles (id, username, username_last_changed_at)
  values (v_user_id, p_username, now())
  on conflict (id) do update
    set username = excluded.username,
        username_last_changed_at = excluded.username_last_changed_at;

  -- Clear existing top 5
  delete from user_top_rappers where user_id = v_user_id;

  -- Insert top 5 by matching rapper names (case-insensitive)
  for i in 1..coalesce(array_length(p_rapper_names, 1), 0) loop
    if p_rapper_names[i] is not null and trim(p_rapper_names[i]) != '' then
      select id into v_rapper_id
      from rappers
      where lower(name) = lower(trim(p_rapper_names[i]))
      limit 1;

      if v_rapper_id is not null then
        v_position := v_position + 1;
        insert into user_top_rappers (user_id, position, rapper_id)
        values (v_user_id, v_position, v_rapper_id);
      end if;
    end if;
  end loop;

  -- Update member_stats
  insert into member_stats (id, top_five_created, updated_at)
  values (v_user_id, 1, now())
  on conflict (id) do update
    set top_five_created = greatest(member_stats.top_five_created, 1),
        updated_at = now();
end;
$$;

-- Add INSERT policy on user_achievements as safety net
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_achievements'
    and policyname = 'Users can receive achievements'
  ) then
    execute 'create policy "Users can receive achievements" on public.user_achievements for insert to authenticated with check (auth.uid() = user_id)';
  end if;
end $$;
