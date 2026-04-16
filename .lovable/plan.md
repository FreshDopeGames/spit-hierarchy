

# Rename "Votes" vs "Ratings" Terminology Across the Site

## Terminology Rules

- **"Ratings" / "Skill Ratings"**: Individual rapper skill ratings (from the `votes` table — the 1-10 scale per category like Flow, Lyricism, etc.)
- **"Votes"**: Ranking votes, VS Match votes, Poll votes — any binary choice or ranked selection

## Files and Changes

### 1. `src/components/rapper/RapperAttributeStats.tsx`
The skill rating radar chart currently says "X votes" under each skill. Change to "X ratings":
- Line 283: `{data.votes} votes` → `{data.votes} ratings`
- Line 370: `{data.votes} votes` → `{data.votes} ratings`

### 2. `src/components/rapper/RapperHeader.tsx`
The badge on rapper profiles shows `{rapper.total_votes || 0} votes`. Since `rapper.total_votes` counts skill ratings from the `votes` table:
- Line 148: `{rapper.total_votes || 0} votes` → `{rapper.total_votes || 0} ratings`

### 3. `src/components/StatsOverview.tsx`
- Line 133: `label: "Total Votes"` → `label: "Total Ratings"` (this counts the `votes` table which is skill ratings)
- Line 138: `label: "Top Voter"` stays as-is (this is from `member_stats.total_votes` which is combined activity — keep as "Top Voter")
- Line 143: `label: "Top Rated"` stays as-is (already correct terminology)

### 4. `src/components/analytics/TopVotedRappersCard.tsx`
This card shows rappers by total skill ratings received. Change:
- Line 71: `Total Votes` → `Total Ratings`
- Also update the card title if it says "Top Voted Rappers" → "Top Rated Rappers"

### 5. `src/components/analytics/GlobalStatsCards.tsx`
- Line 27: `label: "Total Votes"` → `label: "Total Ratings"` (this is from the `votes` table = skill ratings)

### 6. `src/components/analytics/UserVotingDashboard.tsx`
- Line 31: `Total Votes` → `Total Ratings` (shows `memberStats.total_votes` which tracks skill rating activity)

### 7. `src/components/ActivityToastProvider.tsx`
Already correct:
- Line 88: "just voted for ... in [ranking]" — correct (ranking vote)
- Line 144: "just rated [rapper]'s [skill]" — correct (skill rating)

### 8. `src/components/profile/UnifiedProfileHeader.tsx`
- Line 218: `Total Votes Cast` — this is `member_stats.total_votes` which combines all activity. Consider renaming to `Total Activity` or keeping as-is since it's a combined stat on the self-profile view.
- Line 176: `Rappers Rated` stays as-is (already correct)
- Line 202: `VS Match Votes` stays as-is (already correct)

### 9. `src/components/profile/ProfileStats.tsx`
- Line 44: `Rappers Rated` stays as-is (already correct)
- Line 67: `VS Match Votes` stays as-is (already correct)

### 10. `src/components/RapperCard.tsx`
- Line 193: `Votes` label under the Vote icon on rapper cards. Since this shows `rapper.total_votes` (skill ratings), change to `Ratings`

### 11. `src/components/analytics/TopMembersCards.tsx`
- Line 535: `title="Top Voters"` — keep as-is (these are users ranked by combined activity)
- Line 540: `metricLabel="votes"` — keep as-is (combined metric)

### 12. `src/components/admin/forms/AchievementFormFields.tsx`
- Line 30: `{ value: "total_votes", label: "Total Votes" }` → `label: "Total Ratings"` (this threshold is for the `votes` table activity)

### 13. `src/components/StatsOverviewRedesigned.tsx`
- Line 390: `Total Votes` heading → `Total Ratings`
- Line 435: `votes • Top Voter` — keep "Top Voter" but change "votes" to "ratings" if this refers to skill ratings

### Summary
~12 label changes across ~10 files. No database columns, API calls, or logic changes — purely UI text renaming.

