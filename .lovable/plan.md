

## Problem: Votes Revert After Momentary Increase

**Root Cause**: A race condition between the optimistic update and concurrent refetches.

When you vote:
1. The optimistic update correctly increases the count in the UI cache
2. The vote RPC fires and inserts the row into the database
3. **But**: A real-time Supabase subscription on `ranking_votes` detects the INSERT and immediately triggers a cache invalidation + refetch
4. This refetch can execute before the RPC transaction fully commits, pulling stale data that overwrites the optimistic update
5. Additionally, the standard React Query pattern of **cancelling outgoing queries** before applying an optimistic update is missing — so any in-flight polling refetch (every 15 seconds) can also overwrite the optimistic data

The votes ARE saved to the database (confirmed), but the UI reverts because stale data from a racing refetch overwrites the optimistic cache entry.

---

## Plan

### 1. Cancel outgoing queries before optimistic update
In `src/hooks/useRankingVotes.tsx` `onMutate`, add `await queryClient.cancelQueries(...)` for the ranking data query key **before** calling `applyOptimisticUpdate`. This is the standard React Query optimistic update pattern and prevents any in-flight refetch from overwriting the optimistic data.

### 2. Guard real-time subscription during pending votes
In `src/hooks/useRankingData.tsx`, track whether a vote mutation is in progress (via a ref or a query key convention) and skip the real-time invalidation callback when a vote is pending. Alternatively, add a short debounce (~2 seconds) to the real-time callback so the mutation's own `onSuccess` handler takes precedence.

### 3. Delay the `onSuccess` refetch slightly
In `src/hooks/ranking-votes/optimisticUpdates.ts` `invalidateRelatedQueries`, increase the initial refetch delay from immediate to ~500ms to ensure the database transaction is fully committed and visible to PostgREST before refetching.

---

### Technical Details

**File: `src/hooks/useRankingVotes.tsx`** — Add cancel queries in `onMutate`:
```ts
onMutate: async ({ rankingId, rapperId }) => {
  // Cancel any outgoing refetches so they don't overwrite optimistic update
  await queryClient.cancelQueries({ queryKey: ['ranking-data-with-deltas', rankingId] });
  
  const voteWeight = getVoteMultiplier();
  // ... rest of existing code
```

**File: `src/hooks/useRankingData.tsx`** — Debounce the real-time subscription callback to prevent it from racing with the vote mutation's optimistic update. Use a timeout that gets cleared if another event arrives within 2 seconds.

**File: `src/hooks/ranking-votes/optimisticUpdates.ts`** — In `invalidateRelatedQueries`, wrap the initial invalidate+refetch in a ~500ms delay (replacing the immediate call), and keep the existing 1-second follow-up as a safety net.

