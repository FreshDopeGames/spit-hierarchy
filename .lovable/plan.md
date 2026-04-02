

## Plan: Simplify Onboarding to Username-Only + Top 5 Guide Overlay on Profile

### What Changed

The current onboarding has 3 steps (Welcome → Username → Top 5 text inputs). The Top 5 step keeps failing because inserting into `user_top_rappers` triggers `check_and_award_achievements`, which hits FK constraint errors on `user_achievements`. Rather than patching the cascade again, we remove the Top 5 step from onboarding entirely and guide users to use the existing My Top 5 card on their profile page.

### Changes

**1. Simplify `OnboardingModal.tsx` — Remove Step 3 (Top 5)**

- Remove the Top 5 text input step entirely
- Remove `rapperNames` state and `complete_onboarding` RPC call
- On "Continue" from username step: save username directly (upsert via simple query or a new lightweight RPC), then call `onComplete` with a signal to navigate to profile
- The `complete_onboarding` RPC can remain in the DB but won't be called from onboarding anymore

**2. Update `OnboardingProvider.tsx` — Navigate to profile + show guide**

- Import `useNavigate` from react-router-dom
- On `completeOnboarding`: navigate to `/profile`, then set a flag (e.g., `localStorage` item `show-top5-guide`) to trigger the guide overlay
- Add a new state `showTop5Guide` that gets picked up after navigation

**3. Copy the uploaded image to `src/assets/top5-guide.png`**

**4. Create `TopFiveGuideOverlay.tsx`**

A simple Dialog overlay shown on the profile page:
- Title: "Select Your Top 5"
- The uploaded reference image displayed
- Description: "Now it's time to pick your Top 5 rappers. You can change this anytime, and other users will be able to see this when they visit your profile."
- OK button that dismisses the overlay
- Reads and clears the `show-top5-guide` localStorage flag

**5. Add `TopFiveGuideOverlay` to the Profile page**

- Import and render it in the profile page component
- On mount, check for `show-top5-guide` flag; if present, scroll to the My Top 5 section and show the overlay
- Add an `id="my-top-5"` to the `MyTopFiveSection` container div for scroll targeting

**6. Fix the My Top 5 card — Database migration**

The `user_top_rappers` inserts from the profile page trigger `update_member_stats_on_top_five` → `check_and_award_achievements` → inserts into `user_achievements` with FK to `auth.users`. This cascade fails. Fix:

- Update `update_member_stats_on_top_five` to wrap the `check_and_award_achievements` call in an exception handler so it doesn't abort the entire transaction
- OR simpler: update `complete_onboarding` to also handle stats directly and disable the achievement check during top 5 inserts

The cleanest fix: modify the trigger to catch and log errors from the achievement check instead of letting them abort:

```sql
CREATE OR REPLACE FUNCTION update_member_stats_on_top_five()
RETURNS trigger SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.member_stats (id, top_five_created, updated_at)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    top_five_created = GREATEST(public.member_stats.top_five_created, 1),
    updated_at = NOW();
  
  BEGIN
    PERFORM public.check_and_award_achievements(NEW.user_id);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Achievement check failed for user %: %', NEW.user_id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**7. Save username via simple upsert (no RPC needed)**

The onboarding will just save the username and update `member_stats.top_five_created` to mark onboarding as "seen" (even though Top 5 isn't filled yet). A small new RPC `save_onboarding_username` handles this atomically:

```sql
CREATE OR REPLACE FUNCTION public.save_onboarding_username(p_username text)
RETURNS void SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, username, username_last_changed_at)
  VALUES (auth.uid(), p_username, now())
  ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username,
        username_last_changed_at = EXCLUDED.username_last_changed_at;

  INSERT INTO member_stats (id, top_five_created, updated_at)
  VALUES (auth.uid(), 1, now())
  ON CONFLICT (id) DO UPDATE
    SET top_five_created = GREATEST(member_stats.top_five_created, 1),
        updated_at = now();
END;
$$ LANGUAGE plpgsql;
```

### Files

| File | Action |
|------|--------|
| `src/assets/top5-guide.png` | Create (copy from upload) |
| `src/components/onboarding/OnboardingModal.tsx` | Modify — remove step 3, save username via RPC, signal navigation |
| `src/components/onboarding/OnboardingProvider.tsx` | Modify — navigate to `/profile` on complete, set guide flag |
| `src/components/profile/TopFiveGuideOverlay.tsx` | Create — image overlay with title/description/OK |
| `src/components/profile/MyTopFiveSection.tsx` | Modify — add `id="my-top-5"` to container |
| Profile page component | Modify — render `TopFiveGuideOverlay`, handle scroll + flag |
| Migration SQL | Create — `save_onboarding_username` RPC + fix trigger error handling |

