
# Fix KRS-One's Missing Boogie Down Productions Albums

## Problem Summary

KRS-One's discography is missing his essential 1980s albums with **Boogie Down Productions (BDP)**:
- *Criminal Minded* (1987)
- *By All Means Necessary* (1988)  
- *Ghetto Music: The Blueprint of Hip Hop* (1989)
- *Edutainment* (1990)
- *Sex and Violence* (1992)

The group membership detection is working correctly - the Edge Function found BDP and is fetching its releases. However, the current sorting logic processes releases **newest-first**, and with KRS-One's massive 53+ release catalog, the function times out before reaching the 1980s BDP albums.

---

## Root Cause

Current sorting order in `fetch-rapper-discography`:

```text
1. Solo studio albums (newest → oldest): 2025 → 1993
2. Solo EPs (newest → oldest)
3. Group albums (newest → oldest): These never get reached
```

With 7 group memberships and 53 release groups, plus 1.1-second delays between MusicBrainz API calls, the 50-second execution limit is hit after ~12 albums.

---

## Solution: Interleave Group Releases Into Timeline

Modify the sorting logic to **combine solo and group releases into a single timeline sorted by date**, rather than processing solo albums first and group albums last.

### Current Behavior (problematic):
```text
Solo albums first → Groups last → Old group albums get skipped
```

### New Behavior:
```text
All releases combined → Sorted by date (newest first) → BDP 1987 albums still may be cut off...
```

Wait - even interleaving won't fully solve this because KRS-One has 53+ releases and BDP albums are still the oldest. We need a different approach.

---

## Recommended Solution: Hybrid Two-Phase Processing

### Phase 1: Process the N newest releases (current behavior)
### Phase 2: If groups exist, also process the N oldest group releases

This ensures we capture:
- Recent/current work (newest-first)
- Historic/foundational group work (oldest group releases)

### Implementation

**File:** `supabase/functions/fetch-rapper-discography/index.ts`

After sorting release groups, add logic to prioritize oldest group releases:

```text
// Current code (lines 585-600):
// Combines albums and EPs, sorted newest-first

// ADD: Extract and prioritize oldest group releases
const groupReleaseGroupIds = new Set(
  groupMemberships.flatMap(g => {
    // Get all release groups that came from this group artist ID
    return releaseGroups
      .filter(rg => rg._sourceArtistId === g.id)  // Need to track source
      .map(rg => rg.id);
  })
);

// Get the 10 oldest group releases and move them to the front
const oldestGroupReleases = releaseGroups
  .filter(rg => groupReleaseGroupIds.has(rg.id))
  .sort((a, b) => {
    const dateA = a['first-release-date'] || '9999';
    const dateB = b['first-release-date'] || '9999';
    return dateA.localeCompare(dateB); // Oldest first
  })
  .slice(0, 10);

// Prepend oldest group releases, then continue with newest-first solo
const prioritizedReleases = [
  ...oldestGroupReleases,
  ...releaseGroups.filter(rg => !oldestGroupReleases.some(og => og.id === rg.id))
];
```

---

## Simpler Alternative: Manual Migration for KRS-One

Since KRS-One is a specific high-profile case, we can directly link the BDP albums via SQL migration:

```sql
-- Link Boogie Down Productions albums to KRS-One
WITH bdp_albums AS (
  SELECT id FROM albums 
  WHERE musicbrainz_id IN (
    -- Criminal Minded (1987)
    '5a6f1a3e-3b4e-3c9d-9e8f-1a2b3c4d5e6f',
    -- By All Means Necessary (1988)
    '...',
    -- etc.
  )
)
INSERT INTO rapper_albums (rapper_id, album_id, role)
SELECT 
  'bee82e36-5aa9-4514-861b-f4e381fd6b8c', -- KRS-One's ID
  id,
  'primary'
FROM bdp_albums
ON CONFLICT (rapper_id, album_id) DO NOTHING;

-- Update career_start_year to 1987
UPDATE rappers 
SET career_start_year = 1987 
WHERE id = 'bee82e36-5aa9-4514-861b-f4e381fd6b8c';
```

---

## Recommended Approach

**Implement both:**

1. **Immediate fix (migration):** Manually link BDP albums to KRS-One's profile now
2. **Long-term fix (code):** Update sorting logic to prioritize oldest group releases for historical artists

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/fetch-rapper-discography/index.ts` | Add logic to track source artist ID and prioritize oldest group releases |
| New migration | Manually link BDP albums to KRS-One |

---

## Implementation Steps

### Step 1: Create migration to fix KRS-One immediately
- Look up BDP album MusicBrainz IDs
- Insert albums into database if not present
- Link to KRS-One via `rapper_albums`
- Update `career_start_year` to 1987

### Step 2: Update Edge Function sorting logic
- Track which artist ID each release came from
- After combining releases, extract oldest 10 group releases
- Prepend them to the processing queue
- This ensures historic group work is never skipped

---

## Expected Result

After implementation:
- KRS-One's discography includes BDP albums (1987-1992)
- He appears in 1980s decade rankings
- Other solo-from-group artists (Rakim, Q-Tip, etc.) will also get their group albums prioritized

---

## Technical Notes

- The Edge Function already correctly detects group memberships (BDP found for KRS-One)
- The issue is purely sorting/prioritization, not detection
- Adding `_sourceArtistId` tracking to release groups enables smart prioritization
- The 50-second timeout is a hard constraint we must work around
