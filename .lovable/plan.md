

## Problem

The trending icons (up/down/neutral arrows) next to each rapper are **not reflecting real-time position changes**. Here's why:

- The `position_delta` is fetched from a database RPC (`get_position_delta`) that compares the stored `ranking_items.position` against yesterday's snapshot in `ranking_position_history`
- Both of these are only updated by a **daily maintenance job at 3 AM UTC**
- Meanwhile, the UI sorts items by live vote counts (`display_index`), so a rapper can visually move from #8 to #3 during the day, but the trending icon still shows "neutral" because the database position hasn't changed

## Fix

Calculate `position_delta` **client-side** by comparing the real-time vote-sorted position (`display_index`) against the last-known database position (`position` from the daily snapshot). This makes the arrows reflect what users actually see happening in real time.

**Formula**: `position_delta = display_index - position`
- Negative = moved up → TrendingUp icon
- Positive = moved down → TrendingDown icon
- Zero = no change → Neutral icon

## Changes

### File: `src/hooks/useRankingData.tsx`

1. Remove the per-item `get_position_delta` RPC call inside the `Promise.all` loop (this also eliminates N unnecessary database calls per load)
2. After calculating `display_index`, set `position_delta = display_index - item.position` for each item

The icon logic in `RankingItemContent.tsx` already correctly interprets negative delta as "moved up" and positive as "moved down", so no changes needed there.

