
# Replace "View Ranking" with Rapper Count on Ranking Cards

## Overview

Replace the "View Ranking" call-to-action in the bottom right corner of ranking cards with a count of how many rappers are in the ranking. This gives users a snapshot of the ranking size before clicking.

| Current State | New State |
|--------------|-----------|
| "View Ranking" with Award icon | "299 Rappers" with Users icon |

---

## Implementation Steps

### Step 1: Add `totalRappers` Field to Types

**File:** `src/types/rankings.ts`

Add `totalRappers` to both interfaces:

```typescript
// In RankingWithItems interface (line 9-11)
export interface RankingWithItems extends OfficialRanking {
  items: RankingItem[];
  totalRappers?: number;  // Add this
}

// In UnifiedRanking interface (line 14-38)
export interface UnifiedRanking {
  // ... existing fields ...
  totalVotes: number;
  totalRappers: number;  // Add this new field
  isOfficial: boolean;
  // ...
}
```

### Step 2: Fetch Total Rapper Count in `useRankingsData.ts`

**File:** `src/hooks/useRankingsData.ts`

Add a count query for each ranking alongside the existing vote count query:

```typescript
// After fetching itemsData and formattedItems, add:

// Get total rapper count for this ranking
const { count: totalRappers } = await supabase
  .from("ranking_items")
  .select("*", { count: "exact", head: true })
  .eq("ranking_id", ranking.id);

return { 
  ...ranking, 
  items: formattedItems,
  totalVotes: voteCount || 0,
  totalRappers: totalRappers || 0  // Add this
};
```

### Step 3: Update `transformOfficialRankings` to Pass Through Count

**File:** `src/utils/rankingTransformers.ts`

Add `totalRappers` to the transformed ranking object:

```typescript
// In transformOfficialRankings function
return {
  id: ranking.id,
  title: ranking.title || "Untitled Ranking",
  // ... existing fields ...
  totalVotes,
  totalRappers: ranking.totalRappers || ranking.items?.length || 0,  // Add this
  isOfficial: true,
  // ...
};
```

### Step 4: Update `RankingCard.tsx` - Replace "View Ranking" with Rapper Count

**File:** `src/components/rankings/RankingCard.tsx`

Replace the "View Ranking" CTA (lines 236-249) with a rapper count display:

```tsx
// Before (lines 236-249):
{/* View Ranking CTA */}
<div className="flex items-center gap-1 ...">
  <Award className="w-4 h-4" />
  <span>View Ranking</span>
</div>

// After:
{/* Rapper Count */}
<div
  className="flex items-center gap-1 text-xs sm:text-sm"
  style={{
    color: "var(--theme-element-ranking_card_stats-color, #BFBFBF)",
    fontSize: "var(--theme-element-ranking_card_stats-font-size, 0.75rem)",
    fontWeight: "var(--theme-element-ranking_card_stats-font-weight, 400)",
    lineHeight: "var(--theme-element-ranking_card_stats-line-height, 1.25)",
  }}
>
  <Users className="w-4 h-4" />
  <span>{(ranking.totalRappers || ranking.rappers.length).toLocaleString()} Rappers</span>
</div>
```

### Step 5: Update `RankingPreviewCard.tsx` - Replace "View Ranking" with Rapper Count

**File:** `src/components/RankingPreviewCard.tsx`

First, add `totalRappers` to the props interface:

```typescript
interface RankingPreviewCardProps {
  ranking: OfficialRanking;
  items: RankingItem[];
  totalVotes?: number;
  totalRappers?: number;  // Add this
  priority?: boolean;
}
```

Then replace the "View Ranking" CTA (lines 218-231):

```tsx
// Before (lines 218-231):
{/* View Ranking CTA */}
<div className="flex items-center gap-1 ...">
  <Award className="w-4 h-4" />
  <span>View Ranking</span>
</div>

// After:
{/* Rapper Count */}
<div 
  className="flex items-center gap-1 text-xs sm:text-sm"
  style={{
    color: 'var(--theme-element-ranking_card_stats-color, #BFBFBF)',
    fontSize: 'var(--theme-element-ranking_card_stats-font-size, 0.75rem)',
    fontWeight: 'var(--theme-element-ranking_card_stats-font-weight, 400)',
    lineHeight: 'var(--theme-element-ranking_card_stats-line-height, 1.25)'
  }}
>
  <Users className="w-4 h-4" />
  <span>{(totalRappers || items.length).toLocaleString()} Rappers</span>
</div>
```

### Step 6: Update `HomepageRankingSection.tsx` to Pass `totalRappers`

**File:** `src/components/HomepageRankingSection.tsx`

Add a count query in the data fetching and pass it to `RankingPreviewCard`:

```typescript
// In the Promise.all map, add rapper count query:
const { count: totalRappers } = await supabase
  .from("ranking_items")
  .select("*", { count: "exact", head: true })
  .eq("ranking_id", ranking.id);

return {
  ...ranking,
  items: processedItems,
  totalVotes: totalVotes || 0,
  totalRappers: totalRappers || 0  // Add this
};

// Then update the RankingPreviewCard component call:
<RankingPreviewCard 
  key={ranking.id} 
  ranking={ranking} 
  items={ranking.items} 
  totalVotes={ranking.totalVotes}
  totalRappers={ranking.totalRappers}  // Add this
  priority={index === 0} 
/>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/rankings.ts` | Add `totalRappers` field to `RankingWithItems` and `UnifiedRanking` |
| `src/hooks/useRankingsData.ts` | Fetch total rapper count for each ranking |
| `src/utils/rankingTransformers.ts` | Pass through `totalRappers` in transform function |
| `src/components/rankings/RankingCard.tsx` | Replace "View Ranking" with rapper count, use `Users` icon |
| `src/components/RankingPreviewCard.tsx` | Add `totalRappers` prop, replace "View Ranking" with rapper count |
| `src/components/HomepageRankingSection.tsx` | Fetch and pass `totalRappers` to preview cards |

---

## Expected Result

After implementation:

**Rankings Page Cards:**
- Left side: "1,234 Votes" with TrendingUp icon
- Right side: "299 Rappers" with Users icon

**Homepage Preview Cards:**
- Left side: "1,234 Votes" with TrendingUp icon  
- Right side: "35 Rappers" with Users icon (varies per ranking)

Users will immediately see the scale of each ranking before clicking, helping them understand what they're getting into (e.g., "Best Groups" has 35 rappers vs "Greatest Of All Time" has 299).

---

## Technical Notes

- The `Users` icon is already imported in both card components but unused
- The `Award` icon import can be removed after this change
- Uses the same styling as the "Votes" stat for visual consistency
- Fallback to `items.length` or `rappers.length` if `totalRappers` is not available
