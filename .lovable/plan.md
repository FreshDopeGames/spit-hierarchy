

## Plan: Fix Onboarding — Atomic Server-Side Function + Simple Text Inputs

### Root Cause Analysis

Three separate failures are cascading during onboarding:

1. **Username save fails** — Multiple RLS errors on `profiles` table. The update-then-insert fallback works in theory, but timing issues with the auth trigger that creates profile rows cause conflicts.

2. **Top 5 save fails** — The client-side insert into `user_top_rappers` triggers `update_member_stats_on_top_five`, which calls `check_and_award_achievements`, which inserts into `user_achievements`. The `user_achievements` table has **no INSERT RLS policy** — only a SELECT policy. Even though the trigger functions are `SECURITY DEFINER`, the FK constraint check against `auth.users` can still fail in edge cases.

3. **Nested Dialog focus trap** — The rapper search overlay (a Radix Dialog inside a Radix Dialog) has persistent focus/interaction issues that we've tried to fix multiple times but keeps breaking on the live site.

### Solution: Bypass All Client-Side Complexity

Create a single `SECURITY DEFINER` database function `complete_onboarding` that atomically handles username + top 5 in one call. Replace the search overlay with simple text inputs where users just type rapper names. The function matches names to existing rappers server-side.

### Changes

**1. Migration: Create `complete_onboarding` RPC**

```sql
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
  foreach v_rapper_id in array (
    select array_agg(sub.id) from (
      select r.id
      from unnest(p_rapper_names) with ordinality as t(name, ord)
      left join rappers r on lower(r.name) = lower(trim(t.name))
      where r.id is not null
      order by t.ord
    ) sub
  )
  loop
    -- handled below
  end loop;

  -- Simpler approach: iterate rapper names
  for i in 1..array_length(p_rapper_names, 1) loop
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
```

This runs as the DB owner, bypassing all RLS and avoiding trigger cascade issues.

**2. `src/components/onboarding/OnboardingModal.tsx` — Replace search overlay with text inputs**

- Remove `RapperSearchOverlay` and `useUserTopRappers` imports
- Step 3 becomes 5 simple text `<input>` fields where users type rapper names
- On "Complete", call `supabase.rpc('complete_onboarding', { p_username, p_rapper_names })` as a single atomic operation
- Username step (step 2) and Top 5 step (step 3) both collect data locally; the RPC saves everything at once on final submit
- No more nested dialogs, no more multi-step DB writes

**3. Add INSERT policy on `user_achievements` (safety net)**

Add an RLS policy so the trigger functions don't fail even when called outside the onboarding RPC:

```sql
create policy "System can insert achievements"
  on user_achievements for insert
  with check (auth.uid() = user_id);
```

### Technical Details

| Change | Why | Impact |
|--------|-----|--------|
| Single `complete_onboarding` RPC | Atomic, bypasses RLS/trigger cascade | Eliminates all onboarding DB errors |
| Text inputs instead of search overlay | No nested dialog focus trap issues | Reliable on all devices |
| Case-insensitive name matching | Users type "kendrick lamar", matches DB | Tolerant of capitalization |
| `user_achievements` INSERT policy | Safety net for trigger cascade | Fixes non-onboarding achievement errors |

### Files
- **Create**: Migration SQL (RPC + RLS policy)
- **Modify**: `src/components/onboarding/OnboardingModal.tsx`

