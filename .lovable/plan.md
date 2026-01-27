
# Fix Official Ranking Card Top 5 Images

## Problem

The Ranking Cards for official rankings (Best 80s, 90s, etc.) currently display the top 5 rappers based on **database position** (alphabetical order) instead of the **actual vote-based ranking** shown on the detail pages.

| 80s Ranking Card Shows (Wrong) | Detail Page Shows (Correct) |
|------------------------------|---------------------------|
| 1. Beastie Boys (0 votes) | 1. De La Soul (8 votes) |
| 2. Big Daddy Kane | 2. LL Cool J (6 votes) |
| 3. De La Soul | 3. Big Daddy Kane (5 votes) |
| 4. EPMD | 4. MC Lyte (5 votes) |
| 5. Ice-T | 5. Run-D.M.C. (5 votes) |

## Root Cause Analysis

```text
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT FLOW (BROKEN)                        │
├─────────────────────────────────────────────────────────────────┤
│  useRankingsData.ts                                             │
│     ↓                                                           │
│  SELECT * FROM ranking_items                                    │
│  ORDER BY position  ← alphabetical, not vote-based              │
│  LIMIT 5                                                        │
│     ↓                                                           │
│  RankingCard receives items with wrong order                    │
│     ↓                                                           │
│  Card displays Beastie Boys, Big Daddy Kane... (wrong!)         │
└─────────────────────────────────────────────────────────────────┘
```

The detail page (`useRankingData.tsx`) correctly sorts by votes using `sortItemsByVotes()`, but this logic isn't used for the ranking cards.

## Solution

Create an RPC function that returns the top 5 items sorted by actual votes, and use it for official ranking cards.

---

## Implementation Steps

### Step 1: Create RPC Function `get_official_ranking_preview_items`

**File:** New SQL migration

This function returns the top 5 ranking items sorted by:
1. Total vote weight (descending)
2. Database position (ascending) for tie-breaking
3. Alphabetically by name for 0-vote rappers

```sql
CREATE OR REPLACE FUNCTION get_official_ranking_preview_items(
  ranking_uuid UUID,
  item_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  id UUID,
  item_position INTEGER,
  reason TEXT,
  is_ranked BOOLEAN,
  rapper_id UUID,
  rapper_name TEXT,
  rapper_image_url TEXT,
  rapper_slug TEXT,
  ranking_votes BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ri.id,
    ri.position AS item_position,
    ri.reason,
    ri.is_ranked,
    r.id AS rapper_id,
    r.name AS rapper_name,
    r.image_url AS rapper_image_url,
    r.slug AS rapper_slug,
    COALESCE(rvc.total_vote_weight, 0) AS ranking_votes
  FROM ranking_items ri
  JOIN rappers r ON r.id = ri.rapper_id
  LEFT JOIN ranking_vote_counts rvc 
    ON rvc.rapper_id = ri.rapper_id 
    AND rvc.ranking_id = ri.ranking_id
  WHERE ri.ranking_id = ranking_uuid
  ORDER BY
    COALESCE(rvc.total_vote_weight, 0) DESC,
    ri.position ASC,
    r.name ASC
  LIMIT item_limit;
$$;
```

### Step 2: Update `useRankingsData.ts` to Use the RPC

**File:** `src/hooks/useRankingsData.ts`

Replace the direct query with the RPC call:

```typescript
// Before (broken - returns alphabetical order):
const { data: itemsData } = await supabase
  .from("ranking_items")
  .select(`*, rapper:rappers(*)`)
  .eq("ranking_id", ranking.id)
  .order("position")
  .limit(5);

// After (fixed - returns vote-based order):
const { data: itemsData } = await supabase.rpc(
  'get_official_ranking_preview_items',
  { ranking_uuid: ranking.id, item_limit: 5 }
);
```

### Step 3: Update Transform to Handle RPC Response Format

**File:** `src/hooks/useRankingsData.ts`

The RPC returns a flat structure, so we need to reshape it to match the expected format:

```typescript
// Transform RPC response to match existing format
const formattedItems = (itemsData || []).map((item: any) => ({
  id: item.id,
  position: item.item_position,
  reason: item.reason,
  is_ranked: item.is_ranked,
  ranking_votes: item.ranking_votes,
  rapper: {
    id: item.rapper_id,
    name: item.rapper_name,
    image_url: item.rapper_image_url,
    slug: item.rapper_slug
  }
}));

return { 
  ...ranking, 
  items: formattedItems,
  totalVotes: voteCount || 0
};
```

### Step 4: Update `transformOfficialRankings` to Preserve Vote-Based Order

**File:** `src/utils/rankingTransformers.ts`

The items are now pre-sorted by votes, so we use array index for rank instead of `item.position`:

```typescript
// Before (used alphabetical position):
rappers: (ranking.items || []).map(item => ({
  rank: item.position || 0,  // ← position is alphabetical!
  ...
})),

// After (use array index to preserve vote-based order):
rappers: (ranking.items || []).map((item, index) => ({
  rank: index + 1,  // ← preserve RPC's vote-based order
  name: item.rapper?.name || "Unknown",
  reason: item.reason || "",
  id: item.rapper?.id || "",
  image_url: item.rapper?.image_url || undefined
})),
```

---

## Files to Modify

| File | Changes |
|------|---------|
| New SQL migration | Create `get_official_ranking_preview_items` RPC function |
| `src/hooks/useRankingsData.ts` | Use RPC instead of direct query, format response |
| `src/utils/rankingTransformers.ts` | Use array index for rank to preserve vote order |

---

## Expected Result

After implementation:
- **80s Ranking Card** will show: De La Soul, LL Cool J, Big Daddy Kane, MC Lyte, Run-D.M.C.
- **90s Ranking Card** will show the top 5 by votes (2Pac, etc.)
- All other era rankings will display their actual top 5 voters
- The mosaic images will match what users see when they click into the ranking

---

## Technical Notes

- The RPC uses the same sorting logic as `sortItemsByVotes()` in `useRankingData.tsx`
- The `ranking_vote_counts` view aggregates votes per rapper per ranking
- Using `LEFT JOIN` ensures rappers with 0 votes are still included
- The `SECURITY DEFINER` ensures the function runs with proper permissions
