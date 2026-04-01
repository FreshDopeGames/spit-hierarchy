

## Plan: Reduce Largest Contentful Paint (LCP) Across All Page Types

### Problem
LCP is likely bottlenecked by: (1) render-blocking Google Fonts in `<head>`, (2) no `<link rel="preload">` for hero/LCP images, (3) unnecessary `will-change` and GPU layers on every image, and (4) waterfall data fetching before any content can paint.

### Changes

**1. `index.html` — Make Google Fonts non-render-blocking**
- Change the Google Fonts `<link>` to use the `media="print" onload="this.media='all'"` pattern so fonts load async and don't block first paint.
- Add a `<noscript>` fallback for the original `<link>`.

**2. `index.html` — Preload the header logo (LCP element on most pages)**
- Add `<link rel="preload" as="image" href="/lovable-uploads/logo-header.png">` since the header logo appears on every page and is above the fold.

**3. `src/components/ui/EnhancedImage.tsx` — Remove excessive GPU hints**
- Remove `will-change-transform`, `transform-gpu`, `[filter:blur(0)]`, `[backface-visibility:hidden]`, and `translate-z-0`. These force GPU compositing on every image, increasing memory and paint time. Keep only `[image-rendering:auto]` and `antialiased`.

**4. `src/components/BlogCarousel.tsx` — Eagerly decode first carousel image**
- Change `decoding` from `"async"` to `"sync"` for the first (priority) image in the carousel so it paints immediately when data arrives, rather than deferring decode.

**5. `src/components/HomepageRankingSection.tsx` — Preload first ranking card image**
- After the query resolves, inject a `<link rel="preload">` into `<head>` for the first ranking card's rapper image (the likely LCP element on homepage). Use a `useEffect` to do this.

**6. `src/components/RankingsSectionHeader.tsx` — Remove animate-pulse from icons**
- The `animate-pulse` on Crown and TrendingUp icons causes continuous layout/paint work during initial load, competing with LCP. Remove it.

**7. `src/components/ui/ResponsiveImage.tsx` — Skip blur placeholder for priority images**
- When `priority={true}`, skip the blur-up animation entirely (set `isLoaded` to `true` initially) to avoid the extra composite layer and opacity transition that delays LCP.

**8. `src/pages/RapperDetail.tsx` — Lazy load below-fold sections**
- Wrap `RapperDiscography`, `SimilarRappersCard`, `RapperBestQuote`, and `CommentBubble` in lazy imports + `LazySection` to reduce initial JS bundle and speed up above-fold paint.

### Technical Details

| Optimization | Impact | Pages Affected |
|---|---|---|
| Async Google Fonts | Eliminates ~200-500ms render block | All |
| Preload header logo | LCP candidate loads earlier | All |
| Remove GPU hints from EnhancedImage | Less memory, faster compositing | All with images |
| Skip blur-up for priority images | LCP paints immediately | Homepage, Rankings |
| Preload first ranking image | LCP resource discovered earlier | Homepage |
| Remove animate-pulse icons | Less paint work during load | Homepage |
| Lazy load RapperDetail sections | Smaller initial JS, faster FCP | Rapper pages |

### Files
- **Modify**: `index.html`
- **Modify**: `src/components/ui/EnhancedImage.tsx`
- **Modify**: `src/components/ui/ResponsiveImage.tsx`
- **Modify**: `src/components/HomepageRankingSection.tsx`
- **Modify**: `src/components/RankingsSectionHeader.tsx`
- **Modify**: `src/components/BlogCarousel.tsx`
- **Modify**: `src/pages/RapperDetail.tsx`

