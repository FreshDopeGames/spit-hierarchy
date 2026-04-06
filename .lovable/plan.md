

## Plan: Add "Most Viewed" Card to Rapper Statistics Analytics

### What it does
Adds a new card directly under the "Rapper Statistics" heading that shows the rapper with the most page views in the last 7 days, along with a top-5 list of most-viewed rappers. Data comes from the existing `rapper_page_views` table.

### Files

1. **Create `src/hooks/useMostViewedRappers.ts`**
   - React Query hook that queries `rapper_page_views` joined with `rappers`
   - Filters to last 7 days, groups by rapper, orders by count descending, limits to 5
   - Uses two Supabase queries: one RPC or raw query to get rapper_id + count from `rapper_page_views`, then fetches rapper details

2. **Create `src/components/analytics/MostViewedCard.tsx`**
   - Themed card matching existing pattern (black bg, gold/30 border, mogra font title)
   - Eye icon + "Most Viewed" title
   - Hero section: shows #1 rapper with avatar image, name (linked to their page), and view count
   - Below: numbered list of #2–#5 with smaller avatars, names, and view counts
   - Loading skeleton matching existing card patterns
   - "Last 7 days" subtitle text

3. **Modify `src/components/analytics/RapperStatsAnalytics.tsx`**
   - Import and render `MostViewedCard` as a full-width card right after the h3 heading, before the Albums/Cities grid

### Technical approach
Since Supabase doesn't support aggregate queries directly via the JS client on `rapper_page_views`, the hook will:
- Query `rapper_page_views` filtered by `viewed_at >= 7 days ago`
- Group client-side by `rapper_id` and count occurrences
- Fetch rapper details for the top 5 IDs
- Cache with React Query (stale time ~5 minutes)

