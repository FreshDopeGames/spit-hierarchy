
# Replace Rappers Card with Decade Pie Chart

## Summary
Replace the current Rappers stat card (which shows top-rated rapper callouts) with a pie chart showing rappers by career origin decade, using `career_start_year` from the `rappers` table. Recharts is already installed.

## Data
Database has 282 rappers with `career_start_year`: 70s (2), 80s (18), 90s (92), 2000s (68), 2010s (91), 2020s (10). One unknown will be excluded.

## Changes

**File: `src/components/StatsOverviewRedesigned.tsx`**

1. **Update `fetchStats`**: Replace the top-rated rapper queries with a single query:
   ```ts
   supabase.from("rappers").select("career_start_year").not("career_start_year", "is", null)
   ```
   Process into decade counts client-side. Remove `topOverallList`, `topTaggedList`, `tagInfo` from the return shape. Remove the tagged rapper dependent query (Phase 3) and all the `sessionStorage` memoization logic for random rapper picks.

2. **Add Recharts imports**: `PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip`

3. **Define decade colors** (vibrant):
   - 70s: `#FF6B35` (orange)
   - 80s: `#E91E63` (hot pink)
   - 90s: `#9C27B0` (purple)
   - 2000s: `#2196F3` (blue)
   - 2010s: `#00BCD4` (cyan)
   - 2020s: `#4CAF50` (green)

4. **Replace Rappers card JSX** (lines 313-386): Keep the card header (Music2 icon, "Rappers" title, total count). Replace the rapper avatar grid with a `ResponsiveContainer` wrapping a `PieChart` with a bottom-positioned `Legend`. The legend will use a horizontal layout that wraps naturally on mobile.

5. **Remove unused code**: The `topOverallRapper`/`topTaggedRapper` memos, `useEffect` for sessionStorage, `topOverallKey`/`topTaggedKeyBase` variables, `TaggedRapperData` interface, and the random tag query.

No database changes needed. Purely a frontend UI swap.
