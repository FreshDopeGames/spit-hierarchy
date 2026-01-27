
## Plan: Fix Quiz Badge Progress Card Responsive Layout

### Problem Analysis

From the screenshot, the badge cards on mobile are too cramped:
- 3-column grid on mobile makes each card very narrow
- The `aspect-square` constraint forces a fixed height that can't accommodate all content
- Badge names overflow/get cut off (e.g., "Birth Year Beginner")
- Progress bars and counts overlap with the badge name text
- Icons, text, and progress elements compete for limited vertical space

---

### Solution

Redesign the badge card layout to be more spacious on mobile/tablet by:
1. Reducing columns on smaller screens (2 cols on mobile, 3 on tablet)
2. Removing the `aspect-square` constraint in favor of a flexible min-height
3. Increasing internal padding and spacing
4. Using slightly larger text sizes for readability
5. Repositioning progress elements to flow naturally below the name

---

### Technical Details

#### File to Modify: `src/components/quiz/QuizBadgeDisplay.tsx`

**1. Update Grid Column Breakpoints (lines 55-56, 106)**

Change from `grid-cols-3 sm:grid-cols-4 md:grid-cols-6` to `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6`:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
```

**2. Redesign Badge Card Container (lines 117-122)**

Remove `aspect-square` and add proper min-height with more padding:

```tsx
className={cn(
  "relative min-h-[120px] rounded-xl border-2 flex flex-col items-center justify-center p-3 sm:p-4 transition-all duration-200",
  isEarned 
    ? cn(getRarityColor(badge.rarity), getRarityGlow(badge.rarity))
    : "border-border/50 bg-black/20 opacity-60"
)}
```

**3. Increase Icon Size (lines 128-131)**

Make icons slightly larger for better visibility:

```tsx
<IconComponent className={cn(
  "w-7 h-7 sm:w-8 sm:h-8 mb-2",
  isEarned ? "" : "text-muted-foreground"
)} />
```

**4. Improve Badge Name Text (lines 133-138)**

Increase font size and add proper line clamping:

```tsx
<span className={cn(
  "text-xs sm:text-sm text-center font-[var(--theme-font-heading)] leading-tight line-clamp-2",
  !isEarned && "text-muted-foreground"
)}>
  {badge.name}
</span>
```

**5. Redesign Progress Section (lines 140-151)**

Move from absolute positioning to relative flow below the name:

```tsx
{showProgress && !isEarned && (
  <div className="w-full mt-2 px-1">
    <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
      <div
        className="h-full bg-[hsl(var(--theme-primary))]/50"
        style={{ width: `${percentage}%` }}
      />
    </div>
    <span className="text-[10px] text-muted-foreground block text-center mt-0.5">
      {currentProgress}/{badge.threshold_correct}
    </span>
  </div>
)}
```

**6. Adjust Lock Icon Position (lines 124-126)**

Slightly larger lock for visibility:

```tsx
{!isEarned && (
  <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-muted-foreground" />
)}
```

---

### Visual Comparison

| Property | Before | After |
|----------|--------|-------|
| Mobile columns | 3 | 2 |
| Tablet columns | 4 | 3-4 |
| Card height | Fixed (aspect-square) | Flexible (min-h-[120px]) |
| Badge name size | 10px | 12px (xs) - 14px (sm) |
| Progress position | Absolute bottom | Flow below name |
| Internal padding | p-2 | p-3 sm:p-4 |
| Icon size | w-6 h-6 | w-7 h-7 sm:w-8 sm:h-8 |

---

### Expected Result

- Badge cards will be larger and more readable on mobile (2 per row)
- All content (icon, name, progress) will fit without overlapping
- Progress bars will appear below the badge name in their own section
- Text will be more legible across all screen sizes
- Tablet view will show 3-4 columns with comfortable spacing
