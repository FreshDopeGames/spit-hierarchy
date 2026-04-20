

## Goal
Add a single-row, 5-tile auto-rotating rapper avatar mosaic beneath the subtitle on the Rapper Quiz page (`/quiz`).

## Approach

**1. Create new component `src/components/quiz/RotatingRapperMosaic.tsx`**
- Fetch a pool of rappers with `image_url` from Supabase (e.g., top 30-40 by ranking or random sample where `image_url IS NOT NULL`)
- Display 5 tiles in a single horizontal row (`grid-cols-5`)
- Every ~3 seconds, swap one tile (rotating index) with a new random rapper from the pool
- Use Framer Motion `AnimatePresence` for a smooth fade/scale transition per tile swap
- Lazy-load images, fall back to placeholder on error (mirrors `RapperMosaic.tsx` pattern)
- Tile styling: square aspect, rounded, thin border in `--theme-background` to match existing mosaic look

**2. Wire into `src/pages/Quiz.tsx`**
- Import and render `<RotatingRapperMosaic />` directly under the `<p>` subtitle, inside the centered header block
- Constrain width (e.g., `max-w-md mx-auto`) so tiles stay reasonably sized on desktop while filling nicely on mobile (384px viewport → ~5 small square tiles fit comfortably)

## Technical Notes
- Data source: `rappers` table, select `id, name, image_url`, filter `image_url not null`, limit ~40, optional order by `total_votes desc` for recognizable faces
- Cache via React Query (`['quiz-mosaic-rappers']`, long staleTime) so it doesn't refetch on every mount
- Rotation: `useEffect` interval, increment a tile index (0→4→0), pick a random rapper not currently shown to avoid duplicates
- Cleanup interval on unmount; pause when tab hidden via `document.visibilityState` check (cheap perf win)
- No new dependencies — `framer-motion` already used in `QuizContainer.tsx`

## Files
- **New**: `src/components/quiz/RotatingRapperMosaic.tsx`
- **Edit**: `src/pages/Quiz.tsx` (add import + render below subtitle)

