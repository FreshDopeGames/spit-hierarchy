

## Investigation Results

**Root cause**: The `usePollResults` hook in `src/hooks/usePollResults.tsx` queries the `poll_votes` table directly (line 21-28). However, the RLS policy on `poll_votes` only allows users to see their own votes (`auth.uid() = user_id`). This means the vote count aggregation only counts the current user's vote, not all votes.

A `poll_results` database view already exists with columns `poll_id`, `option_id`, and `vote_count` — and it has no RLS restrictions, making it accessible to everyone.

## Plan

### 1. Update `usePollResults` hook to use the `poll_results` view

In `src/hooks/usePollResults.tsx`, change the `usePollResults` query to:
- Fetch from `poll_results` view (which has pre-aggregated vote counts) instead of `poll_votes`
- Join with `poll_options` to get option text
- Calculate percentages from the aggregated `vote_count` column

The `useUserPollVotes` hook is fine — it correctly queries `poll_votes` filtered to the current user.

### Technical Details

Current broken query:
```typescript
supabase.from('poll_votes').select('option_id, poll_options(option_text)').eq('poll_id', pollId)
// RLS filters this to only current user's votes
```

Fixed approach:
```typescript
// Use poll_results view for counts (no RLS restriction)
supabase.from('poll_results').select('option_id, vote_count').eq('poll_id', pollId)
// Separately fetch option text from poll_options
supabase.from('poll_options').select('id, option_text').eq('poll_id', pollId)
```

This is a single-file change to `src/hooks/usePollResults.tsx`.

