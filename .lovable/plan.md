

## Plan: Fix Onboarding and Username Enforcement Bypass for New/Re-created Users

### Root Cause

There are two race condition bugs that allow new users to bypass both the username modal and the onboarding flow:

1. **`useUsernameCheck.ts` (line 24)**: The guard `!!profile` means that if the profile query returns `null` (profile row not yet created by the database trigger, or a brief timing gap), `needsUsername` evaluates to `false` — letting the user through.

2. **`useOnboardingStatus.tsx` (line 27)**: The guard `memberStats ? ... : false` means that if `member_stats` is `null`, `needsOnboarding` is `false` — again letting the user through.

Both hooks have a `staleTime` of 30 seconds, so once the initial `null` result is cached, the check won't re-run for half a minute — plenty of time for the user to navigate freely.

### Fix

**`src/hooks/useUsernameCheck.ts`**
- Change the `needsUsername` logic so a missing profile (`profile === null`) also triggers the enforcement modal:
  ```
  needsUsername = isAuthenticated && !isLoading && (
    !profile ||
    !profile.username ||
    profile.username.trim() === '' ||
    profile.username.includes('@')
  );
  ```
- Reduce `staleTime` to `5 * 1000` (5 seconds) so if the trigger creates the profile slightly after the first query, it re-checks quickly.

**`src/hooks/useOnboardingStatus.tsx`**
- Change `needsOnboarding` so a missing `member_stats` row also triggers onboarding:
  ```
  needsOnboarding = !memberStats || memberStats.top_five_created === 0;
  ```
  (This only evaluates when there's a logged-in user and loading is complete.)

**`src/components/auth/UsernameEnforcementModal.tsx`**
- Add a guard in `handleSave`: if the profile row doesn't exist yet, perform an `upsert` instead of just an `update`, so saving the username works even if the trigger hasn't fired yet.

### Files
- **Modify**: `src/hooks/useUsernameCheck.ts`
- **Modify**: `src/hooks/useOnboardingStatus.tsx`
- **Modify**: `src/components/auth/UsernameEnforcementModal.tsx`

