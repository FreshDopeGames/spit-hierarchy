
## Fix: Trending Icons Are Inverted

**Problem**: The sign convention in `RankingItemContent.tsx` is backwards relative to the delta calculation in `useRankingData.tsx`.

- `position_delta = item.position (old) - displayIndex (current)`
- Positive delta = rapper moved UP (was at position 5, now at 1 → delta = +4)
- Negative delta = rapper moved DOWN (was at position 1, now at 5 → delta = -4)

But the icon logic treats positive as "down" and negative as "up" — exactly reversed.

**Fix in `src/components/rankings/RankingItemContent.tsx`** (lines 32-34):

Swap the icon assignments:
```tsx
// Before (wrong):
if (delta < 0) return <TrendingUp ...green />;
if (delta > 0) return <TrendingDown ...red />;

// After (correct):
if (delta > 0) return <TrendingUp ...green />;
if (delta < 0) return <TrendingDown ...red />;
```

Single file, two-line change.
