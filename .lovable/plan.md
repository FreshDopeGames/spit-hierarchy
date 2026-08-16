# Album review section is in the code but not reaching your browser

## What I verified

- `src/components/admin/BlogPostDialog.tsx` (the same dialog used by both "Create New Post" and "Edit Post") renders `BlogPostAlbumReview` between the main form fields and the SEO/meta fields.
- `src/components/admin/blog/BlogPostAlbumReview.tsx` contains the toggle ("This post is an album review"), the database album search, the MusicBrainz search/import fallback, the five 1-10 metric sliders, the suggested score, the manual /5 field, and the verdict field.
- The dialog also blocks submit when the toggle is on with no album attached.

So the feature exists in the current code. The overlay you are looking at is almost certainly an older cached bundle — this project has hit that before, and `vite.config.ts` still points the service worker at `/sw-update-handler-v6.js`, the same version as the last cached build.

## Plan

1. Bump the service worker cache: add `public/sw-update-handler-v7.js` (copy of v6) and point `vite.config.ts` `importScripts` at it, so browsers drop the stale bundle on next load.
2. Confirm in the running preview with a browser check: open the admin blog tab, open "Create New Post", and screenshot the dialog showing the "This post is an album review" section.
3. If the section renders in preview but not for you after publish, the remaining fix is a hard reload / unregistering the old service worker — I will call that out with the exact steps.

## Notes

No database or edge function changes are needed; the `album_reviews` tables and the two MusicBrainz functions are already deployed. This is purely a cache-invalidation + verification pass.
