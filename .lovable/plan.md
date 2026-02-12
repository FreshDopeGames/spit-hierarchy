

# Fix Slow Profile Page + Email Showing as Name

## Problem Summary

1. **Slow loading**: The profile page blocks rendering until ALL 4 database queries finish. The slowest one (`get_public_profile_stats`) runs expensive JOINs and subqueries. Additionally, `check_and_award_achievements` fires on every visit and loops through every achievement.

2. **Email showing as name**: The fallback `profile?.username || profile?.full_name || user.email` shows the email when the profile query hasn't loaded yet or errors out.

---

## Solution

### 1. Progressive Loading (show content as it arrives)

Instead of waiting for all 4 queries, render the `ProfileHeader` as soon as the profile and member stats load. The other sections (vote notes, public stats, achievements) load independently with their own loading states.

**File: `src/pages/UserProfile.tsx`**
- Split `isDataLoading` into two tiers:
  - **Critical data** (profile + memberStats): blocks the header
  - **Secondary data** (voteNotes, publicStats): each section shows its own loading spinner
- This means the page header appears much faster since it only waits for 2 quick queries

### 2. Fix the Email Fallback

**File: `src/components/profile/ProfileHeader.tsx`**
- Remove `user.email` from the display name fallback chain
- Use a safe fallback like "Loading..." or just show the username/full_name, never the email
- The `profile` data is guaranteed to exist when `ProfileHeader` renders (it's gated by the critical loading check)

### 3. Defer Achievement Tracking

**File: `src/pages/UserProfile.tsx`**
- Move `useProfileAccessTracking` so it doesn't fire until after profile data has loaded, preventing it from competing with the initial data fetch queries

---

## Technical Details

### Changes to `src/pages/UserProfile.tsx`

- Replace `isDataLoading` with `const isCoreLoading = profileLoading || memberStatsLoading;`
- Render `ProfileHeader`, `MyTopFiveSection`, and the onboarding section once core data is ready
- Let `ProfileStats`, `VoteNotesSection`, and other sections handle their own loading states (they already receive data props -- just pass potentially-undefined values and let them show skeletons internally)

### Changes to `src/components/profile/ProfileHeader.tsx`

- Change the name display from:
  `profile?.username || profile?.full_name || user.email`
  to:
  `profile?.username || profile?.full_name || "User"`
- This prevents the email from ever being displayed as the name

### Changes to `src/hooks/useProfileAccessTracking.ts` (optional optimization)

- No structural changes needed, but the 1-second delay in the hook already helps. The main performance win comes from not blocking the UI on all 4 queries.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/UserProfile.tsx` | Split loading into core vs. secondary; render progressively |
| `src/components/profile/ProfileHeader.tsx` | Remove `user.email` from display name fallback |

