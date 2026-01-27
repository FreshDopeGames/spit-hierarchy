
# Fix Ranking Sort Order

## Problem Summary

The "Best 80s Rappers" ranking (and other rankings) shows rappers in incorrect order:
- **Beastie Boys** appears at #1 with 0 votes
- **De La Soul** appears at #3 with 8 votes (should be #1)
- **LL Cool J** appears at #6 with 6 votes (should be #2)

This happens because:
1. The recent migration repopulated the ranking items with default positions
2. The `recalculate_ranking_positions` function (which sorts by votes) only runs once daily at 1 AM
3. The synchronous trigger was previously removed for performance reasons

## Solution

### Part 1: Immediate Frontend Fix
Update the `useRankingData` hook to sort items by votes client-side instead of relying on stale database positions:

- Sort by `ranking_votes` descending (most votes first)
- Then by `position` ascending (earliest vote wins ties)
- Then alphabetically by name (for 0-vote rappers)

This ensures users always see the correct order, regardless of when the database maintenance runs.

### Part 2: Database Position Recalculation
Run `recalculate_ranking_positions()` immediately to fix the current database positions. This ensures:
- Position deltas calculate correctly
- Future refetches have correct data
- Any caching or snapshots are accurate

## Technical Changes

### File: `src/hooks/useRankingData.tsx`

Update the query result processing to sort by votes instead of database position:

```text
Current (line 95):
.order("position", { ascending: true })

Change to client-side sort after fetching:
Sort items by:
1. ranking_votes DESC
2. position ASC (for tie-breaking by earliest vote)
3. rapper.name ASC (for 0-vote rappers)
```

The `calculateVisualRanks` function already sorts correctly but then re-sorts back to database order on line 56. We need to maintain the vote-based order throughout.

### Database: Run Position Recalculation

Execute the existing function to fix current data:
```sql
SELECT recalculate_ranking_positions();
```

This will update all rankings to have correct positions immediately.

## Expected Result

After implementation:
- De La Soul (8 votes) → Position #1
- LL Cool J (6 votes) → Position #2
- Big Daddy Kane, MC Lyte, Run-D.M.C. (5 votes each) → Positions #3-5 (sorted by earliest vote, then alphabetically)
- All 0-vote rappers → Grouped at the bottom, sorted alphabetically

Rankings will display correctly in real-time based on vote counts, with proper tie-breaking for rappers with equal votes.
