

# Split "Total Ratings" Card into Rankings + Ratings Cards

## Problem
The current "Total Ratings" card mixes two different data sources: the headline counts rows from the `votes` table (skill ratings = 3,305), but the "Top Voter" callout pulls from `member_stats.total_votes` (4,132) which includes ranking votes, VS votes, etc. This creates a confusing disparity where a single user appears to have more activity than the entire site total.

## Solution
Replace the single "Total Ratings" card with two separate cards, bringing the grid from 4 to 5 cards (the Rappers card already covers "highest rated" and "top by tag", so we avoid duplicating that).

### New Card 1: "Rankings" Card
- **Headline stat**: Total ranking votes (count from `ranking_votes` table)
- **Callout 1**: Most Active Ranking (already fetched — moved here where it belongs)
- **Callout 2**: Most voted rapper across all ranking lists (new query: group `ranking_votes` by `rapper_id`, join to `rappers` for name/image)
- **Icon**: Trophy or Vote

### New Card 2: "Skill Ratings" Card
- **Headline stat**: Total skill ratings (count from `votes` table — the existing 3,305 number)
- **Callout 1**: Most rated rapper (rapper with highest `total_votes` in `rappers` table — most ratings received)
- **Callout 2**: Top Rater member (the existing top voter callout, but relabeled "Top Rater" since `member_stats.total_votes` for this context tracks skill rating activity). Actually, `member_stats.total_votes` combines all vote types, so we should query the `votes` table directly grouped by `user_id` to get the true top skill rater.
- **Icon**: Star

### Grid Layout
The 5 cards (Rappers, Rankings, Skill Ratings, Members, Slick Talk) will use a responsive grid:
- Mobile: 1 column (unchanged)
- Desktop: 2 columns, with the 5th card spanning full width or sitting alongside the analytics button

## Technical Changes

**File: `src/components/StatsOverviewRedesigned.tsx`**

1. **New queries in `fetchStats`**:
   - Count `ranking_votes` table for Rankings headline
   - Query `ranking_votes` grouped by `rapper_id` to find most-voted rapper across rankings (use RPC or post-process)
   - Query `votes` grouped by `user_id` to find top skill rater (or use existing `member_stats` but relabel appropriately)
   - Query `rappers` ordered by `total_votes` desc for most-rated rapper

2. **Update return shape**:
   - `rankings: { total, mostActiveRanking, mostVotedRapper }`
   - `ratings: { total, mostRatedRapper, topRater }`
   - Remove the old `votes` combined object

3. **Replace the single card JSX** (lines 383-443) with two new card blocks following the same visual pattern as existing cards

4. **Grid stays `grid-cols-1 md:grid-cols-2`** — 5 cards means the last card sits alone on the left at md+, which pairs naturally with the analytics button row below it

No database migrations needed. All data is already available via existing tables and RLS policies.

