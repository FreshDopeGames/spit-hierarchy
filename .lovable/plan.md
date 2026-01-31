
# Mobile Top 5 Ranking Cards - Position Cap Top + Larger Left-Aligned Avatars

## Overview

Redesign the mobile top 5 ranking cards to keep the prominent position cap at the top while creating a horizontal layout below it with a larger left-aligned avatar and metadata/buttons to the right.

---

## New Layout Structure (Mobile Top 5)

```
+------------------------------------------+
|            [1] Position Cap              |  <- Full-width bar at TOP (kept)
+------------------------------------------+
| [AVATAR]  | Kendrick Lamar         ↑    |
|  112x112  | Compton, CA            ─    |
|           | ★ 156 votes                 |
|           |                      [VOTE] |
+------------------------------------------+
```

- Position cap: Stays at top (full-width horizontal bar) to distinguish legendary positions
- Below cap: Horizontal layout with larger avatar on left
- Avatar: 112x112 (larger than current 80x80)
- Metadata: Left-aligned to the right of avatar
- Vote button: Positioned at bottom-right of the content row

---

## Changes by Component

### 1. RankingItemCard.tsx

Keep the outer card as `flex-col` for mobile top 5, but change the **content wrapper** to `flex-row`:

| Element | Current | New |
|---------|---------|-----|
| Outer layout | `flex-col` | `flex-col` (keep - position cap on top) |
| Content wrapper | `flex-col` | `flex-row` (avatar left, metadata right) |
| Card height | `min-h-[140px]` | `min-h-[150px]` (slightly taller for larger avatar) |

---

### 2. RankingItemPositionCap.tsx

No changes needed - mobile top 5 already uses `h-10 w-full` with `rounded-t-lg`.

---

### 3. RankingItemContent.tsx

Update mobile top 5 to use horizontal layout with larger avatar:

| Function | Current | New |
|----------|---------|-----|
| `getImageSize()` mobile top 5 | `w-20 h-20` (80px) | `w-28 h-28` (112px) |
| `getContentAlignment()` mobile top 5 | `items-center text-center` | `items-start text-left` |
| Main container flex | `flex-col` for mobile top 5 | `flex-row` (avatar and text side by side) |
| Name/reason alignment | `flex-col items-center` | `flex-col items-start` |
| Vote count justify | `justify-center` | `justify-start` |

---

### 4. RankingItemVoteSection.tsx

Update mobile top 5 vote button to be right-aligned with auto width:

| Function | Current | New |
|----------|---------|-----|
| `getContainerAlignment()` mobile top 5 | `w-full flex justify-center` | `flex items-center justify-end` |
| `getVoteButtonWidth()` mobile top 5 | `w-full` | `w-auto` |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/rankings/RankingItemCard.tsx` | Change content wrapper from `flex-col` to `flex-row` for mobile top 5, adjust height |
| `src/components/rankings/RankingItemContent.tsx` | Larger avatar (28x28/112px), always `flex-row`, left-align all text |
| `src/components/rankings/RankingItemVoteSection.tsx` | Right-align vote button with auto width |

---

## Visual Result

The top 5 cards on mobile will now have:
- A prominent full-width position cap at the top displaying the rank (1-5) - preserved for legendary distinction
- Below the cap: a horizontal row with large 112x112 avatar on the left
- Rapper name, origin, and vote count left-aligned next to the avatar
- Vote button tucked in the right side of the row

This gives maximum prominence to both the legendary rank position AND the rapper's image.
