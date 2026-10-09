# ListenBrainz Play Stats on Album Detail Pages

Show real-world play counts on each Album Detail page, pulled from the ListenBrainz API and refreshed daily.

## What you'll see

- A new "Listening Stats" block on every Album Detail page showing:
  - **Total plays** — all-time plays of the album from ListenBrainz users
  - **Top tracks** — the album's most-played tracks with play counts
- Albums with no tracked plays show a "No plays tracked yet" placeholder instead of an empty gap.
- Numbers update once a day automatically; page loads stay fast because stats are cached in our database.

## How it works

1. **New table `album_listen_stats`**: one row per album — `album_id`, `total_listen_count`, `total_user_count`, `top_tracks` (JSONB: recording name + listen count), `fetched_at`. Public read access; writes only from the backend job.
2. **New Edge Function `fetch-listenbrainz-stats`**: loops over albums that have a `musicbrainz_id`, calls:
   - `GET /1/stats/release-group/(mbid)/listeners` for total plays/listeners
   - `GET /1/popularity/top-recordings-for-artist/(artist_mbid)` filtered to the album's tracks for top tracks
   - Respectful rate limiting (~1 req/sec, matching our existing MusicBrainz fetcher pattern), upserts results, skips albums without an MBID.
3. **Daily schedule**: pg_cron job (same pattern as the Trending Rappers cron) calls the function once per day.
4. **Frontend**: `useAlbumListenStats` hook + `AlbumListenStats.tsx` component on `AlbumDetail.tsx`, placed below the track list. Shows total plays, unique listeners, and a ranked top-tracks list; placeholder text when the album has no data.

## Technical details

- ListenBrainz API is free, no API key required.
- Data reflects ListenBrainz community scrobbles only (not Spotify/Apple totals); niche albums may have low or zero counts.
- RLS: `album_listen_stats` gets a public SELECT policy; only the service role can write.
- Migration includes GRANTs for anon/authenticated/service_role per project standards.
- No changes to existing rating/review features.

## Verification

- Run the function once manually against a well-known album to confirm real numbers come back.
- Playwright check on an Album Detail page: stats block renders with plays and top tracks; a no-data album shows the placeholder.
