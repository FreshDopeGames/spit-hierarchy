# On-site Music Player for Album Pages

## Can we use ListenBrainz's player?
Not directly. ListenBrainz's "BrainzPlayer" isn't an embeddable widget — it's built into their own site and just wraps other services (YouTube, Spotify, Apple Music, SoundCloud). Copying it would bring their open-source license obligations onto Spit Hierarchy. We can build the same idea ourselves using the same official embeds.

## What users will get
- A play button next to each track in the album's track list (and in the "Top tracks" list in Listening Stats).
- A slim sticky player bar at the bottom of the screen showing the song, rapper, play/pause, next/previous, and a small video thumbnail. It keeps playing while scrolling the page.
- "Play album" button in the album header that queues every track in order.
- If a track can't be found, its play button is hidden — nothing broken shows.

## Sources (same as ListenBrainz)
1. **YouTube (main source, full songs, free for listeners).** We look up each track once on YouTube, save the video, and reuse it forever, so we stay well within YouTube's free daily limit. Requires a free YouTube API key from Google Cloud that you'd add.
2. **Spotify album embed (bonus).** When an album already has a direct Spotify link, show Spotify's official mini player too. Visitors logged into Spotify hear full songs; others hear 30-second previews. No key needed.

## Steps
1. You create a YouTube Data API key (I'll give click-by-click steps) and save it as a secret.
2. Add storage for each track's matched YouTube video (plus "not found" so we don't search again).
3. Backend function that finds the official video/audio for tracks missing one (prefers "Official Audio"/"Topic" uploads, checks duration roughly matches), run on page visit for that album and nightly in small batches.
4. Build the player bar + play buttons + "Play album," using the site's black/gold styling.
5. Add the Spotify embed under the header when a direct Spotify link exists.
6. Verify on Kanye's Jesus Is King and an album with no matches.

## Technical details
- Table `track_youtube_matches` (track_id unique, youtube_video_id nullable, status matched/not_found, checked_at); public SELECT, service_role write, RLS on, grants included.
- Edge Function `match-track-youtube` (Zod-validated album_id), uses YouTube `search.list` (videoCategoryId=10) + `videos.list` duration check; secret `YOUTUBE_API_KEY`. pg_cron daily batch respecting quota (~90 searches/day; on-demand album matches prioritized).
- Player: global `PlayerProvider` context inside BrowserRouter using the YouTube IFrame Player API, so playback survives navigation between pages; `StickyPlayerBar` file-scoped component.
- Spotify: `open.spotify.com/embed/album/{id}` iframe, only when `external_cover_links.spotify` is a direct album URL (not a search link).
- Also finish the pending top-tracks matching fix and remove temporary debug logging.
