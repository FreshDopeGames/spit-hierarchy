
## Plan: Style Earned Badge Cards with Theme Primary Fill

### Overview

Update the Quiz Badge Display component so earned badges stand out with a filled theme primary background and black elements, creating clear visual contrast against the muted in-progress badges.

---

### Changes

#### File: `src/components/quiz/QuizBadgeDisplay.tsx`

**1. Update Badge Card Container Styling (lines 117-122)**

Replace the current rarity-based coloring for earned badges with theme primary fill:

```tsx
className={cn(
  "relative min-h-[120px] rounded-xl border-2 flex flex-col items-center justify-center p-3 sm:p-4 transition-all duration-200",
  isEarned 
    ? "bg-[hsl(var(--theme-primary))] border-black"
    : "border-border/50 bg-black/20 opacity-60"
)}
```

**2. Update Icon Styling (lines 128-131)**

Change earned badge icons to black:

```tsx
<IconComponent className={cn(
  "w-7 h-7 sm:w-8 sm:h-8 mb-2",
  isEarned ? "text-black" : "text-muted-foreground"
)} />
```

**3. Update Badge Name Text (lines 133-138)**

Change earned badge text to black:

```tsx
<span className={cn(
  "text-xs sm:text-sm text-center font-[var(--theme-font-heading)] leading-tight line-clamp-2",
  isEarned ? "text-black" : "text-muted-foreground"
)}>
  {badge.name}
</span>
```

**4. Remove Rarity Color/Glow Usage**

The `getRarityColor` and `getRarityGlow` functions will no longer be used for card styling (they can remain in the hook for other potential uses).

---

### Visual Result

| Element | Earned Badge | In-Progress Badge |
|---------|-------------|-------------------|
| Background | Theme primary color (solid fill) | Dark/transparent (bg-black/20) |
| Border | Black (2px solid) | Muted border (border-border/50) |
| Icon | Black | Muted gray |
| Text | Black | Muted gray |
| Opacity | Full (100%) | Reduced (60%) |

---

### Technical Details

- Uses `bg-[hsl(var(--theme-primary))]` for the filled background following the project's theme CSS variable syntax
- Black elements (`text-black`, `border-black`) ensure readability against any primary color
- In-progress badges retain their current muted appearance with lock icons and progress bars
