

# Fix Terminology in Top Rappers By Category Card

## Summary
The data and threshold logic are confirmed accurate. The only change needed is renaming the display label from "votes" to "ratings" in the card UI, consistent with the terminology update we've been applying across the site.

## Verified Data Accuracy
- The `vote_count` field correctly counts how many unique member rating submissions exist per rapper per skill category
- The progressive threshold (3 → 2 → 1) is working as intended
- Example: Black Thought has 4 ratings in Beat Selection, most others have 3 — these are real counts

## Change

**File: `src/components/analytics/TopRappersByCategoryCard.tsx`** (line 124)
- Change `{rapper.vote_count} votes` → `{rapper.vote_count} ratings`

That's the only change needed. One line.

