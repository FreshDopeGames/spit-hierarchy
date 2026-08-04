# Official Album Reviews in Blog Posts

Let admins turn a blog post into an official Spit Hierarchy album review: pick the album (from our DB, or import it fresh from MusicBrainz), score it on the same five metrics users rate albums with, and publish a manual overall score out of 5.

## Data model

- **`album_reviews`** — one review per blog post
  - links to a blog post and to an album
  - `overall_score` — admin-entered, 0.5–5.0 in half-star steps (manual)
  - `verdict` — short one-line summary shown in the score card
  - `reviewer_id` — the admin who scored it
  - unique on blog post; unique on album so one album has one official review
- **`album_review_scores`** — one row per review per metric
  - reuses existing `album_voting_categories` (Production, Lyricism, Cohesion, Replay Value, Cultural Impact), scored 1–10 like the community modal
  - displayed as a breakdown but does **not** drive the overall number
- **Access rules**: anyone can read reviews attached to published posts; admins and blog editors can create/edit/delete. Grants for `anon`, `authenticated`, and `service_role` are included in the migration.

## Album lookup in the new/edit blog post overlay

- Toggle: "This post is an album review"
- Search box searches our `albums` table first (title + artist), showing cover, artist, release year
- If nothing matches, a "Search MusicBrainz" fallback lists release-groups from MB (artist-scoped when an artist is picked), showing title, type, first release date
- Selecting a MusicBrainz result imports it: creates the `albums` row (title, MBID, release date, type, track count, label), links it to the artist via `rapper_albums`, caches cover art into the existing `album-covers` bucket, and optionally pulls the tracklist — reusing the logic and rate-limit handling already in the discography functions
- Once an album is attached, the five metric sliders (1–10) appear, an equal-weight suggested score is shown for reference, and the admin types the final score out of 5
- Everything saves alongside the post so drafts keep their scores

## Display

- **Blog post page**: score card near the top — album cover, artist/album title (linking to the album detail page), large /5 star score, verdict line, and the five-metric breakdown bars. Review metadata added to the post's structured data so search engines see a rating.
- **Album detail page**: editorial score shown beside the existing community rating ("Spit Hierarchy Review: 4.5/5"), with a link to the full review post. Community average stays unchanged and separate — editorial and user scores are never blended.

## Technical notes

- Two new Supabase edge functions: one to search MusicBrainz release-groups, one to import a selected release into `albums` + `rapper_albums` (both admin-gated, honoring the existing 1100ms MusicBrainz delay and audit logging)
- New hooks: `useAlbumReview(albumId | postId)` for reads, plus an admin mutation hook that saves the review and metric rows together, with `.select('id')` verification per the project's silent-RLS-failure rule
- Metric definitions come from `album_voting_categories`, so adding a category later flows into both user ratings and editorial reviews
- Editorial scores are stored independently of `album_votes`, so `recompute_album_rating_aggregates` and the community average are untouched
- Admin dropdowns/inputs in the new section follow the existing themed dark-overlay styling
