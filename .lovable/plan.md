## Album Rating System

Mirror the existing rapper rating UX for albums: multi-category 1-10 ratings, with the average overall score shown right on the album page near the cover art.

### Data model

Add a new `album_votes` table (parallel to `votes`):

- `album_id` → albums(id)
- `user_id` → auth.users(id)
- `category_id` → `album_voting_categories(id)`
- `rating` smallint (1-10)
- timestamps
- UNIQUE (user_id, album_id, category_id)

Add `album_voting_categories` table (parallel to `voting_categories`) so album skills can differ from rapper skills. Seeded with:

- Production
- Lyricism
- Cohesion / Flow
- Replay Value
- Cultural Impact

Add aggregate columns to `albums`:

- `average_rating` numeric (mean across all category votes, scale 1-10)
- `total_ratings` integer (unique rater count)

A trigger on `album_votes` insert/update/delete recomputes these for the affected album (same pattern as the rapper votes aggregator).

RLS:

- `album_votes`: anyone can `SELECT` aggregate-friendly rows; authenticated users can insert/update/delete their own rows only.
- `album_voting_categories`: public `SELECT`, admin-only write.
- Standard `GRANT`s for `anon`, `authenticated`, `service_role`.

### Hooks

New under `src/hooks/`:

- `useAlbumVotingCategories.ts` — fetches active categories.
- `useAlbumVoting.ts` — fetches existing user votes for an album, submit/update mutation, optimistic update + 500ms refetch delay (matches the voting race-condition memory).
- `useAlbumRatingStats.ts` — returns `{ averageRating, totalRatings }` from the `albums` row.

### UI

- New `src/components/album/AlbumRatingButton.tsx`: a compact "Rate this album" button that shows the current average (e.g. `8.4` with a star) and rater count, or `N/A` when there are zero ratings (consistent with the rapper N/A memory). Placed inside `AlbumHeader` directly under the artist row / streaming buttons.
- New `src/components/album/AlbumVoteModal.tsx`: modeled on `VoteModal.tsx` — lists all album categories with a 1-10 slider per category, allows partial submission, "Update" vs "Submit" labeling based on existing votes. Single overall slider per category, no /100 conversion.
- Reuses `RatingSlider` styling (1-10 only — drop the `/100` helper text for the album variant).
- Guests see the button but clicking prompts sign-in (same pattern as `TrackVoteButton`).

### AlbumDetail wiring

- `useAlbumDetail` already returns `album_id`; pass it plus the new average/total fields (extend the RPC `get_album_by_slugs` to also return `average_rating` and `total_ratings`).
- Mount `<AlbumRatingButton />` inside `AlbumHeader`.

### Out of scope

- Rapper-style percentile / ranking across all albums.
- Track-level ratings (existing track upvotes stay as-is).
- Surfacing album ratings in discography grids or search results (can be a follow-up).

### Technical notes

- Aggregate trigger is `VOLATILE SECURITY DEFINER` per DB function constraints memory.
- Mutations use `.select('id')` and verify length > 0 (silent-RLS memory).
- New components are file-scoped (no inline child components).
- Theme colors via `cn()` only; no inline styles.
