

## Plan: Reduce Cumulative Layout Shift (CLS) Across All Pages

### Root Causes Identified

A CLS of 0.36 is "Poor" (good is < 0.1). After auditing the codebase, here are the main contributors:

1. **Duplicate font loading** -- Google Fonts are loaded TWICE: once via `@import` in `src/index.css` (render-blocking) AND once via `<link>` in `index.html`. The CSS `@import` blocks rendering and causes text to reflow when fonts swap in.

2. **Components that return `null` then expand** -- `HomepagePoll`, `BlogCarousel`, `GuestCallToAction`, `ContentAdUnit`, and `HomepageRankingSection` all render nothing (or collapse to zero height) during loading, then pop into existence, pushing everything below them down.

3. **Ad units with no reserved space** -- `ContentAdUnit`/`AdSenseUnit` render with unknown height, then either expand when an ad loads or collapse to `null` when it fails, shifting all content below.

4. **LazySection has no minimum height** -- The wrapper `<div ref={ref}>` reserves zero space until content loads, causing a jump.

5. **Images without explicit dimensions** -- `EnhancedImage` and `LazyImage` don't enforce width/height or aspect-ratio on the `<img>` element, so the browser can't reserve space before the image loads.

6. **Header auth state change** -- The header shows a "Sign In" button initially, then swaps to a user avatar+dropdown once auth loads, potentially changing the header's internal layout.

---

### Changes (7 files)

**1. Remove duplicate font import from `src/index.css`** (line 2)
- Delete `@import url('https://fonts.googleapis.com/...')` -- the same fonts are already loaded async in `index.html` with a proper `media="print" onload` pattern.
- Add `font-display: swap` fallback system font stacks to prevent invisible text during font load (FOIT).

**2. Reserve space for lazy-loaded sections in `src/pages/Index.tsx`**
- Give each `LazySection`'s `SectionPlaceholder` a realistic `min-h` matching the content it will hold (e.g., `min-h-[400px]` for StatsOverview, `min-h-[300px]` for HomepagePoll, `min-h-[200px]` for GuestCallToAction).

**3. Fix `HomepagePoll` collapsing to null in `src/components/polls/HomepagePoll.tsx`**
- When `isLoading`, return a placeholder with `min-h-[300px]` instead of `null`.
- When `polls.length === 0`, return a zero-height div instead of null to avoid parent container shift.

**4. Fix `ContentAdUnit` layout shift in `src/components/ads/ContentAdUnit.tsx`**
- Reserve a fixed `min-h` (e.g., 90px for medium, 250px for large) while the ad is loading.
- When the ad fails, collapse gracefully with a CSS transition instead of snapping to `null`.
- Use `contain: layout` on the ad container to isolate its layout impact.

**5. Add `min-h` to `LazySection` wrapper in `src/components/LazySection.tsx`**
- Accept an optional `minHeight` prop and apply it to the container div so it reserves vertical space before content loads.

**6. Add aspect-ratio fallback to `EnhancedImage` in `src/components/ui/EnhancedImage.tsx`**
- Accept optional `aspectRatio` prop (e.g., `"4/3"`, `"16/9"`).
- Apply `aspect-ratio` CSS on the container so the browser reserves the correct space before the image downloads.

**7. Stabilize header auth area in `src/components/HeaderNavigation.tsx`**
- Give the right-side container a fixed `min-w` (e.g., `min-w-[100px]`) so the space is reserved regardless of whether the skeleton, avatar, or "Sign In" button is rendered.

---

### Summary of expected impact

| Fix | Est. CLS reduction |
|-----|-------------------|
| Remove duplicate font @import | -0.05 to -0.10 |
| Reserve space for lazy sections | -0.08 to -0.12 |
| Stabilize ad containers | -0.03 to -0.05 |
| Image aspect-ratio reservations | -0.02 to -0.04 |
| Header auth area stabilization | -0.01 to -0.02 |
| **Total estimated** | **-0.19 to -0.33** |

Target: bring CLS from ~0.36 down to < 0.1 (Good).

