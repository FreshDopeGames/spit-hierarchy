

# Add Album Search to Global Search Bar

## Overview

Extend the global search to also search albums alongside rappers. Results will be grouped into two sections -- "Rappers" and "Albums" -- so users can find and navigate to any album directly.

## What Changes

### 1. New Album Search Hook

Create a `useAlbumSearch` hook that queries the `albums` table with a debounced search term, joining through `rapper_albums` to include the rapper name and slug (needed for the album URL pattern `/rapper/:rapperSlug/:albumSlug`).

### 2. Update GlobalSearch Component

- Use the new `useAlbumSearch` hook alongside the existing rapper autocomplete
- Change placeholder text from "Search for rappers..." to "Search rappers and albums..."
- Display results in two labeled sections:
  - **Rappers** -- existing rapper results with the Music icon and avatar (unchanged)
  - **Albums** -- album results showing cover art thumbnail, album title, rapper name, and release type badge (Album/Mixtape)
- Clicking an album navigates to `/rapper/{rapperSlug}/{albumSlug}`
- The "No results" state only shows when BOTH rapper and album searches return empty
- The results count footer combines both totals

### 3. Album Search Query

Query the `albums` table directly using `.ilike('title', '%term%')` joined with `rapper_albums` and `rappers` to get the rapper name and slug. Limited to 15 results, ordered by title.

---

## Technical Details

### New file: `src/hooks/useAlbumSearch.ts`

- Mirrors `useRapperAutocomplete` pattern (debounced search, react-query)
- Query: `supabase.from('albums').select('id, title, slug, cover_art_url, release_type, rapper_albums(rappers(name, slug))').ilike('title', '%term%').limit(15)`
- Returns array of `{ id, title, slug, cover_art_url, release_type, rapper_name, rapper_slug }`
- Flattens the nested join so the component gets a clean interface

### Modified file: `src/components/GlobalSearch.tsx`

- Import and call `useAlbumSearch` with the same `searchTerm`
- Combine loading states: `isSearching = rapperSearching || albumSearching`
- Combine empty check: show "no results" only when both are empty
- Render rapper results under a "Rappers" subheader (only if results exist)
- Render album results under a "Albums" subheader (only if results exist)
- Album result row: cover art thumbnail (40x40, rounded, with Disc3 fallback icon), title, rapper name subtitle, release type badge
- Album click handler: `navigate(/rapper/${rapper_slug}/${album_slug})`
- Update results count to sum both lists

| File | Change |
|------|--------|
| `src/hooks/useAlbumSearch.ts` | New hook for searching albums by title |
| `src/components/GlobalSearch.tsx` | Add album results section alongside rappers |

