# Trending Rappers (Daily)

A homepage section showing the top 5 rappers most-mentioned across hip-hop news and Reddit over the last 3 days, refreshed automatically each morning via a cron job.

## What gets built

1. **New database table** `trending_rappers` — stores the daily snapshot (rank 1–5, rapper_id, mention count, sources, score, generated_at). Public read access; only the edge function writes.
2. **New edge function** `generate-trending-rappers` — scans an expanded list of RSS feeds and Reddit, scores rappers, writes the snapshot.
3. **Daily cron job** at ~6 AM Pacific via `pg_cron` + `pg_net`, calling the edge function.
4. **Homepage section** "Trending Rappers" — 5 cards with avatar, name, rank, mention count, and a small "trending" indicator. Positioned alongside existing homepage rankings.
5. **React hook** `useTrendingRappers` for fetching the latest snapshot (cached 15 min).

## Data sources

- **Existing 7 RSS feeds** from Weekly Rap-Up (XXL, The Source, 2DOPEBOYZ, AllHipHop, Complex, Billboard, Spin)
- **Expanded RSS feeds**: HotNewHipHop, HipHopDX, Rap-Up, Pitchfork (rap section), Hypebeast (music)
- **Reddit JSON** (no auth): r/hiphopheads/new.json, r/rap/new.json, r/hiphop101/new.json

All sources are filtered to the last 3 days.

## Ranking signal

Each rapper mention contributes a weighted score:

```text
score = sum over mentions of (recency_weight × source_weight)

recency_weight:
  today        = 1.0
  yesterday    = 0.7
  2 days ago   = 0.4

source_weight:
  unique source bonus: +0.5 per distinct source the rapper appears in
  (e.g. mentioned by 4 different outlets > mentioned 4x in one outlet)
```

Same rapper-tagging logic as Weekly Rap-Up: aliases respected, blocklist applied (`big`, `ice`, `young`, `lil`, `king`, etc.), case-sensitive for ambiguous names like "The Game".

Top 5 by final score win. Ties broken by raw mention count, then alphabetical.

## Homepage section

A new section "Trending Rappers" placed near the top of the homepage (above or beside existing ranking sections — final placement TBD during build). Shows 5 horizontal cards on desktop / stacked on mobile, each linking to the rapper's detail page. Includes a subtitle like "Most talked about in hip-hop media — past 3 days" and a small "Updated [time]" timestamp.

## Technical details

- **Function**: `supabase/functions/generate-trending-rappers/index.ts`, `verify_jwt = false`
- **Cron**: `pg_cron` schedule `0 14 * * *` UTC (6 AM PT). Uses `net.http_post` with anon key
- **Table RLS**: `SELECT` public, no public `INSERT`/`UPDATE`/`DELETE` (function uses service role)
- **Reddit fetching**: `User-Agent` header required; 200 newest posts per subreddit; parse `title + selftext`
- **Snapshot strategy**: each run inserts a new row per rank with the same `generated_at`. The hook reads `WHERE generated_at = (SELECT MAX(generated_at) FROM trending_rappers)`. Old snapshots retained for history/analytics
- **Source diversity**: tracked in a `sources` text[] column for transparency
- **Fallback**: if a run produces fewer than 5 rappers (slow news day), keep the previous snapshot — do not overwrite with partial results

## Out of scope (this iteration)

- Twitter/X mentions (requires paid API)
- Trending tracks/albums
- User-facing "why is this trending?" detail view
- Push notifications when a new rapper enters the top 5
