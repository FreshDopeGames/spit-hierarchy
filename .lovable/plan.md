## 1. Draft / Published status for rappers

### Database
- Add `publish_status` column to `rappers`: `text NOT NULL DEFAULT 'published'` with a CHECK in `('draft','published')`.
  - Default `'published'` so all existing rappers stay live.
  - New rappers created from the admin form default to `'draft'` (set in form UI, not column default — keeps backfill safe).
- Add `published_at timestamptz` (nullable) — set automatically by a trigger when `publish_status` flips to `'published'` for the first time. Useful for sorting/audit.
- Index: `CREATE INDEX rappers_publish_status_idx ON rappers (publish_status);`

### Visibility model: "Preserve everything, just hide"
Votes, ratings, comments, ranking_items, daily_vote_tracking, etc. are **never deleted or modified** when a rapper is moved to draft. They remain in the DB exactly as-is so flipping back to published instantly restores the rapper with full history.

The hiding is done at the read layer:

**Public-facing queries** must filter `publish_status = 'published'`. Files that need updating:
- `src/hooks/useAllRappers.ts`, `useHotRappers.tsx`, `useMostViewedRappers.ts`, `useTopRappersByCategory.ts`, `useSimilarRappers.ts`, `useRapperSearch.ts`, `useRapperAutocomplete.ts`, `useRapperStats.ts`, `useRapperAgeStats.ts`, `useCareerLengthStats.ts`, `useTopCitiesStats.ts`, `useTopTagsStats.ts`, `useAllRapperTags.ts`, `useRankingData.tsx`, `useRankingsData.ts`, `useOptimizedUserRankings.ts`, `useUserTopRappers.ts`, `useVSMatches.tsx`, `useAdminVSMatches.tsx` (admin: no filter), `useTrackArtists.ts`, `useMentionedRappers.ts`.
- `src/services/userRankingService.ts`, `src/services/optimizedUserRankingService.ts`.
- `src/components/GlobalSearch.tsx` (rapper results).
- `src/pages/RapperDetail.tsx` — if `publish_status='draft'` and viewer is not admin/staff, return 404.
- Edge functions that emit public data: `generate-sitemap` (exclude drafts), `og-redirect` (404 for drafts), `tag-rappers-in-blog-posts` (skip drafts).
- Aggregates such as Zodiac distribution, analytics top lists, ranking previews — all flow through the hooks above, so once filtered there they're hidden in aggregates too.

**Admin queries keep showing everything**: `AdminRapperManagement.tsx` (and its table) must be untouched re: filter, but should display a Draft / Published badge and let staff filter by status.

### Admin UI
- Add a `Status` toggle (Draft / Published) at the top of `RapperFormFields.tsx`, styled with the existing themed select.
- New rappers default to **Draft** so the editor can prepare avatar/bio before going live.
- In `AdminRapperTable`, add a small Draft badge on the row when applicable, plus a status filter in `AdminRapperManagement.tsx` (alongside the existing sort dropdown).

### RLS
Public read RLS on `rappers` already allows all rows (frontend filters). To harden: replace the existing public SELECT policy with one that allows `publish_status = 'published' OR is_admin() OR is_moderator_or_admin()`. This guarantees drafts cannot leak even if a hook forgets to filter.

---

## 2. AI portrait generator in the Edit Rapper dialog

### Where it lives
Add a new tab "AI Portrait" in `AdminRapperDialog` (alongside Details and Avatar Upload). On the Avatar Upload tab itself, also add a "Generate with AI" button as a shortcut.

### UI flow
1. Editor uploads **1–3 reference photos** via drag-drop zone (validated 5MB each, jpg/png/webp, using existing `useEnhancedFileValidation` patterns).
2. Optional "extra prompt notes" textarea (e.g. "wearing a fitted cap", "early-2000s era").
3. "Generate Portrait" button calls a new Supabase edge function `generate-rapper-portrait`.
4. On success, four candidate previews are shown (4 generations per click). Editor clicks one → it's uploaded to the existing rapper-images storage bucket via the same path used in `useRapperAvatarUpload`, then `rappers.image_url` is updated. Other candidates are discarded.

### Edge function: `generate-rapper-portrait`
- Input: `{ rapperId, referenceImages: string[] (data URLs), extraNotes?: string }`. Validates admin via JWT and `has_role('admin')`.
- Calls Lovable AI Gateway with `google/gemini-3-pro-image-preview` (Nano Banana Pro) for higher fidelity. Uses **multi-image edit** input shape: one user message containing the fixed style text + the reference image_urls.
- Fixed style prompt (single source of truth, stored as a constant in the function):
  > "Studio portrait of {rapperName}, photorealistic, 3/4 angle, head and upper shoulders, neutral charcoal seamless backdrop, soft key light from upper left, subtle rim light, sharp focus on eyes, 50mm lens look, color-graded warm shadows / cool highlights. Match the likeness of the reference photos faithfully — same face, hairstyle, and signature style cues. No text, no watermark, no logos."
- Generates 4 candidates (4 sequential calls so we get variation).
- Returns the 4 base64 image URLs to the client (NOT stored server-side until editor picks one — keeps storage clean).

### Secrets
Uses `LOVABLE_API_KEY` (already available in the project — confirm with `fetch_secrets`). No external search API needed since reference comes from upload.

### Storage / privacy
- Reference uploads are sent as data URLs in-memory only; not persisted.
- Final chosen portrait goes into the existing rapper avatar bucket using current upload pipeline so caching, sizing, and the `useRapperImage` hook continue to work without changes.

---

## 3. Out of scope for this pass
- Bulk regeneration of existing rapper portraits.
- Web-search-based reference fetching (deferred per your answer).
- Per-rapper override of the style prompt.

---

## Technical summary
- **Migration**: add `publish_status`, `published_at`, index, trigger, updated SELECT RLS.
- **Frontend filters**: ~20 hooks/services + RapperDetail 404 path.
- **Admin UI**: Status field + table badge + status filter.
- **New edge function**: `generate-rapper-portrait` (Gemini 3 Pro Image, fixed style, 1–3 refs, 4 candidates).
- **New components**: `AIPortraitGenerator.tsx` inside `src/components/admin/rapper-avatar/`, plus a new tab in `AdminRapperDialog`.
- **Sitemap/OG**: exclude drafts.
