

# Add Visual Animation for Ranking Reordering

## Overview

When a user votes for a rapper, the list should visually animate to show the rapper moving up in the rankings. Currently, the vote is applied optimistically (vote count increments instantly), but the list doesn't reorder until a refetch happens ~1 second later. This plan adds smooth animations to make reordering noticeable and satisfying.

## Current Behavior

1. User clicks vote button
2. Vote count increments immediately (optimistic update in `optimisticUpdates.ts`)
3. Card shows pending state (yellow ring + pulsing dot)
4. **No visual movement** until refetch ~1 second later
5. List suddenly jumps to new order (jarring UX)

## Proposed Solution

Use Framer Motion's `layout` animation system to smoothly animate ranking items when they change position. This requires:

1. **Immediate re-sorting after optimistic update** - so items move right away
2. **Framer Motion `layout` prop** - to animate the position change smoothly
3. **Visual indicators** - brief glow effect on items that just moved up

---

## Technical Implementation

### Step 1: Update Optimistic Updates to Re-sort Data

**File:** `src/hooks/ranking-votes/optimisticUpdates.ts`

Add re-sorting logic to `applyOptimisticUpdate` so the list reorders immediately after a vote:

```text
import { sortItemsByVotes, calculateVisualRanks } from './useRankingData';

export const applyOptimisticUpdate = (...) => {
  queryClient.setQueryData<RankingItemWithDelta[]>(
    ['ranking-data-with-deltas', rankingId],
    (oldData) => {
      if (!oldData) return oldData;
      
      // 1. Update vote count and mark as "just moved"
      const updatedData = oldData.map(item => {
        if (item.rapper?.id === rapperId) {
          return {
            ...item,
            ranking_votes: item.ranking_votes + voteWeight,
            isPending: true,
            justMoved: true  // New flag for animation
          };
        }
        return { ...item, justMoved: false };
      });
      
      // 2. Re-sort by votes so item moves immediately
      const sorted = sortItemsByVotes(updatedData);
      const withRanks = calculateVisualRanks(sorted);
      
      // 3. Recalculate display_index
      return withRanks.map((item, index) => ({
        ...item,
        display_index: index + 1
      }));
    }
  );
};
```

### Step 2: Export Sorting Functions from useRankingData

**File:** `src/hooks/useRankingData.tsx`

Export the existing sorting functions so they can be reused:

```text
// Change from:
const sortItemsByVotes = (items: RankingItemWithDelta[]) => { ... }
const calculateVisualRanks = (items: RankingItemWithDelta[]) => { ... }

// Change to:
export const sortItemsByVotes = (items: RankingItemWithDelta[]) => { ... }
export const calculateVisualRanks = (items: RankingItemWithDelta[]) => { ... }
```

### Step 3: Wrap Ranking Items with Framer Motion

**File:** `src/components/rankings/OfficialRankingItems.tsx`

Add `AnimatePresence` and use `motion.div` with `layout` prop:

```text
import { motion, AnimatePresence } from "framer-motion";

// In the render:
<AnimatePresence mode="popLayout">
  {displayedItems.map((item) => (
    <motion.div
      key={item.id}
      layout
      layoutId={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: item.justMoved ? [1, 1.02, 1] : 1
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        layout: { type: "spring", stiffness: 350, damping: 30 },
        opacity: { duration: 0.2 }
      }}
    >
      <RankingItemCard ... />
    </motion.div>
  ))}
</AnimatePresence>
```

### Step 4: Add "Just Moved" Visual Indicator

**File:** `src/components/rankings/RankingItemCard.tsx`

Add a brief gold glow effect when an item moves up:

```text
const justMoved = (item as any).justMoved || false;

// In className:
className={`... ${
  justMoved ? 'ring-2 ring-rap-gold/70 shadow-lg shadow-rap-gold/20' : ''
}`}
```

### Step 5: Clear "Just Moved" State After Animation

**File:** `src/hooks/ranking-votes/optimisticUpdates.ts`

Add function to clear the `justMoved` flag after animation completes:

```text
export const clearJustMovedStates = (
  queryClient: QueryClient,
  rankingId: string
) => {
  setTimeout(() => {
    queryClient.setQueryData<RankingItemWithDelta[]>(
      ['ranking-data-with-deltas', rankingId],
      (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(item => ({ ...item, justMoved: false }));
      }
    );
  }, 600); // Clear after animation completes
};
```

---

## Animation Flow

```text
User clicks vote
       ↓
Optimistic update runs
       ↓
Vote count increments + justMoved = true
       ↓
List re-sorts immediately
       ↓
Framer Motion animates position change (spring physics)
       ↓
Card glows gold briefly (justMoved indicator)
       ↓
After 600ms, justMoved cleared
       ↓
After 1s, server refetch confirms final state
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useRankingData.tsx` | Export `sortItemsByVotes` and `calculateVisualRanks` functions |
| `src/hooks/ranking-votes/optimisticUpdates.ts` | Add re-sorting logic, add `justMoved` tracking, add `clearJustMovedStates` function |
| `src/components/rankings/OfficialRankingItems.tsx` | Add Framer Motion `AnimatePresence` and `motion.div` with `layout` prop |
| `src/components/rankings/RankingItemCard.tsx` | Add gold glow styling when `justMoved` is true |

---

## Expected UX Result

1. User votes for a rapper
2. Vote count increments **instantly**
3. Card glows gold and **smoothly slides up** to new position
4. Other cards smoothly slide down to make room
5. Glow fades after ~0.5 seconds
6. Server confirms the final state after 1 second

This creates a satisfying, game-like feedback loop that encourages more voting.

