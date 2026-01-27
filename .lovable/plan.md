

# Fix KRS-One's Decade Classification

## Problem Summary

KRS-One is appearing in "Best 90s Rappers" instead of "Best 80s Rappers" because:

1. **His earliest linked album is from 1993** - "Return of the Boom Bap" (his first solo album)
2. **Boogie Down Productions albums are not in the database** - The essential 1987-1992 BDP albums don't exist yet
3. **The Edge Function was updated but not re-run** - The hybrid prioritization code was deployed, but KRS-One's discography hasn't been refreshed

| Current State | Expected State |
|--------------|----------------|
| First release: 1993-09-28 | First release: 1987 |
| Appears in: 90s rankings | Should appear in: 80s rankings |
| BDP albums: Not linked | BDP albums: Criminal Minded, By All Means Necessary, etc. |

---

## Solution

Trigger a discography refresh for KRS-One using the updated Edge Function. The new prioritization logic will:
1. Detect Boogie Down Productions as a group membership
2. Prioritize the 10 oldest BDP releases (1987-1992)
3. Insert those albums into the database
4. Link them to KRS-One via `rapper_albums`

This will automatically:
- Set his first release year to 1987
- Move him to "Best 80s Rappers" rankings (via `clean_official_ranking_items`)

---

## Implementation Steps

### Step 1: Trigger Discography Refresh

Call the `fetch-rapper-discography` Edge Function for KRS-One with `forceRefresh: true`:

```typescript
// Endpoint: /fetch-rapper-discography
// Method: POST
// Body:
{
  "rapperId": "bee82e36-5aa9-4514-861b-f4e381fd6b8c",
  "forceRefresh": true
}
```

### Step 2: Verify BDP Albums Were Inserted

After the Edge Function runs, verify:
- Criminal Minded (1987) is in the `albums` table
- By All Means Necessary (1988) is linked
- KRS-One's first release year is now 1987

### Step 3: Run Ranking Cleanup (Optional)

If KRS-One doesn't automatically move to the 80s rankings, manually trigger:

```sql
SELECT clean_official_ranking_items();
SELECT populate_ranking_with_rappers();
```

---

## Expected Result

After implementation:
- KRS-One's discography includes BDP albums (1987-1992)
- His first release year is calculated as 1987
- He appears in "Best 80s Rappers" instead of "Best 90s Rappers"
- The decade filtering logic correctly categorizes him as an 80s artist

---

## Technical Notes

- The Edge Function update (hybrid two-phase processing) was deployed earlier today
- It prioritizes the 10 oldest group releases to ensure historic work isn't skipped
- The `forceRefresh` flag bypasses the reconciliation safety check
- No code changes needed - just need to trigger the existing function

