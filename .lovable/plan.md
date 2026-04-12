

## Fix: Vote Buttons Reset After Idling

### Root Cause

The query key in `useDailyVoteStatus` includes `user?.id`:

```text
queryKey: ['daily-votes', user?.id, getTodayKey(), rankingId]
```

When the Supabase auth token refreshes after an idle period, `user` can momentarily become `null` during the `TOKEN_REFRESHED` auth state change. This shifts the query key to `['daily-votes', undefined, ...]`, which is a completely different cache entry with no data. The `dailyVotes` array falls back to `[]`, and every button appears un-voted.

Once the auth refresh completes, the key reverts to the correct one, a refetch returns the real votes, and all buttons snap back to green -- exactly what you observed.

### Fix (1 file)

**`src/hooks/useDailyVoteStatus.tsx`**

1. Make `hasVotedToday` also check localStorage as a fallback, so even if the react-query cache is momentarily empty (due to a key change), the button still shows the correct voted state.
2. Add `placeholderData: keepPreviousData` to the query so that when the key changes during token refresh, react-query continues displaying the previous data instead of resetting to `[]`.

These two changes together eliminate the flash of "available" vote buttons during auth token refreshes.

### Technical Detail

- `keepPreviousData` is imported from `@tanstack/react-query` and tells the query to keep showing data from the previous query key while the new key's data is loading.
- The localStorage fallback in `hasVotedToday` acts as a second safety net: even if query data is empty for any reason, the locally persisted vote records are checked.

