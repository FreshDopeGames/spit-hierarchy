
# Fix Decade Filtering for Official Rankings

## Problem Summary

The "Best 80s Rappers" ranking (and any future decade-based rankings) includes rappers who should not be there. For example:
- **A$AP Rocky** (career_start_year: 2011, first_album: 2011)
- **Drake** (career_start_year: 2016, first_album: 2006)
- **Childish Gambino** (career_start_year: 2009)
- **Big Sean** (career_start_year: 2009)

These artists clearly should NOT be in an 80s rappers list.

## Root Cause

The current `populate_ranking_with_rappers` function uses **two incorrect criteria** for decade filtering:

```text
1. birth_year - This is the rapper's birthdate, not when they started rapping
2. career_start_year - This field has inaccurate data for many rappers
```

The function currently matches if EITHER `birth_year` OR `career_start_year` falls within the decade range. This causes Drake (born 1986) to appear in the 80s list because his `birth_year` is 1986, even though his first album was released in 2006.

## Correct Approach

Based on your documented preference, decade filtering should use the **first discography release year** from the `albums` table via the `rapper_albums` junction table:

```text
MIN(EXTRACT(YEAR FROM albums.release_date)) FROM albums
JOIN rapper_albums ON albums.id = rapper_albums.album_id
WHERE rapper_albums.rapper_id = rappers.id
```

This provides accurate, verifiable data based on actual discography.

### Verified 80s Rappers (based on first album release)
- Run-D.M.C. (1984)
- LL Cool J (1985)
- Beastie Boys (1986)
- MC Hammer (1986)
- Salt-N-Pepa (1986)
- Ice-T (1987)
- Public Enemy (1987)
- Too $hort (1987)
- Big Daddy Kane (1988)
- EPMD (1988)
- MC Lyte (1988)
- NWA (1988)
- De La Soul (1989)
- Queen Latifah (1989)
- Roxanne Shanté (1989)

---

## Implementation Plan

### Step 1: Update `populate_ranking_with_rappers` Function

Create a new migration that rewrites the function to use first album release year for decade filtering:

**Key changes:**
- Add a subquery/join to calculate each rapper's first album release year from the `albums` and `rapper_albums` tables
- Replace the `birth_year`/`career_start_year` logic with the first album year logic
- Handle rappers with no album data gracefully (exclude them from decade-filtered rankings)

### Step 2: Update `clean_official_ranking_items` Function

Update this function to use the same first-album-year logic for consistency:
- Ensure rappers that don't match the decade filter (based on first album) are removed when filters are updated
- Use identical logic to `populate_ranking_with_rappers` for consistency

### Step 3: Repopulate All Decade-Based Rankings

After deploying the updated functions:
- Run `populate_ranking_with_rappers` for the "Best 80s Rappers" ranking
- This will clear incorrect entries and add only rappers whose first album was released in 1980-1989
- Future decade rankings (90s, 2000s, 2010s, 2020s) will automatically work correctly

---

## Technical Details

### Updated SQL Logic for Decade Filtering

```text
-- Calculate first album year for each rapper using a subquery
SELECT r.id
FROM rappers r
WHERE EXISTS (
  SELECT 1
  FROM rapper_albums ra
  JOIN albums a ON ra.album_id = a.id
  WHERE ra.rapper_id = r.id
    AND a.release_date IS NOT NULL
  GROUP BY ra.rapper_id
  HAVING MIN(EXTRACT(YEAR FROM a.release_date)::INT)
    BETWEEN <decade_start> AND <decade_end>
)
```

### Files to Create/Modify

1. **New Migration File** (`supabase/migrations/YYYYMMDD_fix_decade_filtering.sql`)
   - Updated `populate_ranking_with_rappers` function
   - Updated `clean_official_ranking_items` function
   - Repopulate command for all decade-filtered rankings

### Other Filtered Rankings (Unaffected)

The following rankings use different filter types that don't need changes:
- **Best Groups** - Uses `artist_types: ["group"]` (works correctly)
- **Best Speed Rappers** - Uses `tag_ids` (should work if tags are assigned)
- **Hit-Makers** - Uses `tag_ids`
- **Most Slept On** - Uses `tag_ids`
- **Vibe Royalty** - Uses `tag_ids`

---

## Expected Outcome

After implementation:
- The "Best 80s Rappers" ranking will only contain ~15 rappers whose first album was released between 1980-1989
- Any future decade-based rankings will use the same accurate filtering logic
- Tag-based and artist-type-based filters will continue working as expected
