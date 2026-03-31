

## Plan: Allow Users to Change Poll Votes + Admin Voting Lock

### Overview
Currently, once a user votes on a poll, their vote is permanent (no UPDATE or DELETE on `poll_votes`). We need to:
1. Add a `voting_locked` boolean column to the `polls` table so admins can lock voting changes
2. Allow users to delete their existing votes and re-vote (change response) when the poll is not locked
3. Add a "Lock Voting" toggle to the admin poll editor
4. Update the PollWidget to show a "Change Vote" button when the user has already voted and the poll isn't locked

### Database Migration

Add column to `polls` table:
```sql
ALTER TABLE polls ADD COLUMN voting_locked boolean NOT NULL DEFAULT false;
```

Update RLS on `poll_votes` to allow users to DELETE their own votes (currently blocked):
```sql
CREATE POLICY "Users can delete own votes on unlocked polls"
ON public.poll_votes
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM polls
    WHERE polls.id = poll_votes.poll_id
    AND polls.voting_locked = false
    AND polls.status = 'active'
  )
);
```

### File Changes

**`src/components/admin/PollDialog.tsx`**
- Add `voting_locked` to the form schema (boolean, default false)
- Add a "Lock Voting" Switch field in the form (next to the existing toggles), with description: "Prevent users from changing their votes"
- Include `voting_locked` in the poll data sent to Supabase on save
- Load `voting_locked` from existing poll when editing

**`src/components/polls/PollWidget.tsx`**
- Add `voting_locked` to the `Poll` interface
- When `shouldShowResults` is true AND `userHasVoted` AND poll is NOT `voting_locked`: show a "Change Vote" button below the results
- Clicking "Change Vote" deletes existing user votes from `poll_votes`, resets local state, and shows the voting interface again

**`src/hooks/usePollVoting.tsx`**
- Add a `changeVote` mutation that first deletes existing votes for the user+poll, then inserts new ones
- Or simpler: add a `deleteVotes` function that deletes existing votes, and reuse `submitVote` for the new vote

**`src/components/admin/PollManagement.tsx`**
- Include `voting_locked` in the poll query so it's passed to the dialog when editing

### User Flow
1. User votes on a poll -> sees results with "Your choice" badge + "Change Vote" button
2. User clicks "Change Vote" -> previous votes are deleted, voting interface reappears
3. User submits new vote -> results update
4. Admin toggles "Lock Voting" on -> "Change Vote" button disappears, votes are permanent

### Files
- **Migration**: Add `voting_locked` column + DELETE RLS policy on `poll_votes`
- **Modify**: `src/components/admin/PollDialog.tsx`
- **Modify**: `src/components/polls/PollWidget.tsx`
- **Modify**: `src/hooks/usePollVoting.tsx`
- **Modify**: `src/components/admin/PollManagement.tsx`

