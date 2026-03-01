

## Investigation Results

**Database state is correct**: J. Cole has 37 total vote weight, Jay-Z has 34. The `sortItemsByVotes` function sorts by `ranking_votes` descending, so J. Cole should appear above Jay-Z.

**Root cause**: Aggressive caching prevents the UI from reflecting the correct sort order.

1. `staleTime: 5 * 60 * 1000` (5 minutes) — data considered fresh for 5 minutes, suppressing refetches
2. `refetchOnWindowFocus: false` — switching tabs doesn't trigger a refresh
3. After a vote, `invalidateRelatedQueries` fires with a 1-second delayed second invalidation, but the `staleTime` may cause the component to serve the cached (stale-sorted) data until the timer expires

**The optimistic update should work** during the moment of voting (it re-sorts locally), but once the real refetch completes, the response is cached with the 5-minute stale window. If the user loaded the page when J. Cole had fewer votes, that cached order may persist.

## Plan

### 1. Reduce `staleTime` in `useRankingData.tsx`
- Change `staleTime` from `5 * 60 * 1000` (5 minutes) to `30 * 1000` (30 seconds)
- This ensures the vote-sorted data refreshes more promptly after invalidation

### 2. Re-enable `refetchOnWindowFocus` 
- Change `refetchOnWindowFocus` from `false` to `true` (default)
- Users switching back to the tab will see fresh data

### 3. Force immediate refetch after vote success
- In `invalidateRelatedQueries`, after invalidating the ranking data query, also call `queryClient.refetchQueries()` for the ranking data to ensure the cache is actually refreshed, not just marked stale

These are small changes to two files: `src/hooks/useRankingData.tsx` (lines 157-158) and `src/hooks/ranking-votes/optimisticUpdates.ts` (lines 105-108).

