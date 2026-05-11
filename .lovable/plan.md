## Polls audit findings

**Database state (live):**
- 2 active polls exist:
  1. Homepage (featured): "Who should be the 300th Rap GOAT on Spit Hierarchy?" — 4 votes captured
  2. All-blogs placement: "What kinds of blog posts do you want to see more of?" — 1 vote captured
- The `poll_results` view returns correct tallies for both. **Blog polls are capturing and aggregating votes correctly** at the data layer.

**Display path for blog polls:**
- `BlogPoll.tsx` queries `usePolls('specific_blog', blogPostId)` + `usePolls('all_blogs')` and renders `PollWidget` for each.
- `PollWidget` shows results when `userHasVoted` is true (via `useUserPollVotes`) or after a fresh vote.
- A logged-out user on a blog post will see the "Members Only / Sign up" locked state instead of results — this is the most likely reason it *looked* broken. Code is functioning as designed.

**Likely past issue (already resolved):** earlier fix to `usePollResults` switched to the `poll_results` aggregated view, which fixed empty results. No code bug remains.

I'll do one more pass during implementation to confirm nothing is regressed (vote → result transition, percentage rendering, "Change Vote" path).

---

## New feature: session-start homepage poll popup

Trigger the featured homepage poll as a modal once per browser session for logged-in members who haven't voted yet.

### Behavior
- Show only if: user is authenticated, a featured active homepage poll exists, user has no row in `poll_votes` for it, and the modal hasn't already been shown this session.
- Fire ~1.5s after first authenticated page load (any route) to avoid clobbering initial render.
- Dismissible via close button or "Maybe later"; submitting a vote also closes it.
- Once dismissed or voted, do not reopen until a new browser session (uses `sessionStorage` key `poll-modal-shown-{pollId}`).
- Skip on `/auth` and during onboarding flow to avoid stacking modals.

### Technical details
- New component `src/components/polls/SessionPollModal.tsx` wrapping `PollWidget` inside a shadcn `Dialog`.
  - Reuses existing `useFeaturedPolls()` (limit 1) and `useUserPollVotes(pollId)`.
  - Shows nothing while loading; opens dialog only when all conditions pass.
- Mount once globally in `src/App.tsx` (inside auth + router providers, alongside existing global modals).
- Respect existing memory rule: no nested Radix Dialogs — guard with a check for any open dialog (`document.querySelector('[role="dialog"]')`) or simply suppress when onboarding/username modals are active by checking the same hooks they use (`useOnboardingStatus`, username enforcement).
- Styling: match `PollWidget`'s existing themed card; modal uses standard dark overlay (the recently-fixed solid background pattern from `AdminRapperDeleteDialog`).

### Files
- Add: `src/components/polls/SessionPollModal.tsx`
- Edit: `src/App.tsx` (mount the modal)

No DB changes required — existing `poll_votes` + `useUserPollVotes` already tell us if the user has voted.

---

## Open question
Should the popup also appear for non-featured homepage polls if the featured one is exhausted/voted, or strictly the single featured poll? Default in plan: strictly the featured one (matches current homepage section).
