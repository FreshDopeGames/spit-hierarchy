# Save the album-review plan to NEXT_FEATURES.md

Append a new "Planned: Official Album Reviews in Blog Posts" section to `docs/NEXT_FEATURES.md` (under the Low Priority / Future block, before the Recently Completed section) capturing the full album-review feature plan:

- **Data model**: new `album_reviews` table (links blog post + album, manual `overall_score` 0.5–5.0, `verdict`, `reviewer_id`, unique on post and album) and `album_review_scores` table (one row per metric reusing `album_voting_categories`, scored 1–10). Access rules: public read on published posts, admin/blog-editor write.
- **Album lookup in the blog post overlay**: DB search first, then MusicBrainz release-group search/import (creates `albums` + `rapper_albums`, caches cover art, pulls tracklist), then five 1–10 metric sliders plus the manual /5 score; saves with drafts.
- **Display**: score card on the blog post page (cover, title link, /5 stars, verdict, metric breakdown) with rating structured data; editorial score next to community rating on the album detail page linking to the review.
- **Technical notes**: two admin-gated edge functions (MB search + import) honoring existing 1100ms delay and audit logging; `useAlbumReview` read hook + admin mutation hook with `.select('id')` verification; metrics sourced from `album_voting_categories`; editorial scores kept separate from `album_votes` and `recompute_album_rating_aggregates`; themed dark-overlay styling.

No code changes beyond writing to this docs file.