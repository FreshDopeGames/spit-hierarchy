

# Fix Pie Chart: Keep Animation, Remove Active Shape on Tap

## Problem
Tapping a pie segment still shows a rounded rectangle outline (Recharts' default active shape). The `activeIndex={-1}` and `activeShape={undefined}` approach isn't fully suppressing it.

## Changes

**File: `src/components/StatsOverviewRedesigned.tsx`**

1. Re-enable the entry animation: change `isAnimationActive={false}` → `isAnimationActive={true}`
2. Replace `activeIndex={-1}` and `activeShape={undefined}` with `activeShape={() => null}` — a render function that returns nothing, fully preventing any active shape from rendering on tap/click.

