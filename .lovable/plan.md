# Trending Rappers: fix the stale cron + add media mention links

## Why it says "15 days ago"

The newest snapshot in `trending_rappers` is from **Aug 15, 2026** — the same day the edge functions were security-hardened.

- The daily cron job (jobid 3, 14:00 UTC) still fires and reports "succeeded" every day, including yesterday.
- But it posts to `generate-trending-rappers` with only an `apikey` header and **no `Authorization: Bearer` header**.
- The hardened function now rejects any request without a bearer token equal to the service role key (or an admin user JWT), so every run since Aug 15 returns 401 and nothing is written. The cron reports success because the HTTP post itself succeeded.

## Fix

Reschedule the cron command so it sends `Authorization: Bearer <service role key>`, with the key read from Supabase Vault rather than inlined in the job definition. Then run the function once manually to refresh today's snapshot and confirm a new `generated_at` lands.

## New feature: media mention links on the rapper page

Place a "In The News" card on the rapper detail page, between **Community Stats** and **You Might Rock With**, listing the recent headlines that mentioned the rapper (headline text, source name, date), each linking out to the original article in a new tab. The card hides itself when there are no recent mentions.

Right now the pipeline only stores source *names* for the top 5 rappers — no article titles or URLs — so mention headlines have to start being captured.

### Technical detail

1. **New table `rapper_media_mentions`**: `id`, `rapper_id` (FK), `title`, `url`, `source`, `published_at`, `created_at`; unique on (`rapper_id`, `url`) so re-runs upsert instead of duplicating. Public `SELECT` grant to `anon`/`authenticated` with a read-only RLS policy; `service_role` full access for the edge function.
2. **`generate-trending-rappers`**: capture `<link>` from RSS items and `permalink`/`url` from Reddit posts (currently discarded), and upsert one mention row per matched rapper per item — for *all* matched rappers, not just the top 5. Keep the existing `trending_rappers` snapshot logic unchanged. Add a cleanup that deletes mentions older than 30 days.
3. **New hook `useRapperMediaMentions(rapperId)`**: most recent mentions (limit ~6, last 30 days), ordered by `published_at` desc.
4. **New component `RapperMediaMentions`** rendered in `src/pages/RapperDetail.tsx` between `RapperStats` and `SimilarRappersCard`, styled with the existing themed card, gold accents, and external-link icons; lazy-loaded like the similar-rappers card.

Note: headlines only accumulate from the next run forward — the card will populate for rappers mentioned in the last 3 days of feeds, and fill out over subsequent daily runs.
