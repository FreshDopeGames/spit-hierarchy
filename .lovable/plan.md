# Trending Rappers — Blog-Mention Fallback

## Goal

When the daily `generate-trending-rappers` job finds fewer than 5 rappers from RSS + Reddit scanning, fill the remaining slots with rappers mentioned in the **2 most recent published blog posts** that contain rapper links — instead of keeping the previous day's snapshot.

## How it works

1. After scoring RSS/Reddit mentions, check if fewer than 5 rappers qualify.
2. If short, query the latest published `blog_posts` ordered by `published_at desc`.
3. For each post, extract rapper slugs from markdown links using the same regex pattern as `useMentionedRappers` — `[Name](/rapper/slug)` and `[Name](https://spithierarchy.com/rapper/slug)`.
4. Walk posts one at a time until we've collected mentions from **2 posts that actually contain rapper links** (skip posts with zero mentions).
5. Look up those slugs in the `rappers` table, filter out any already in the trending list, and append them in mention order until we have 5 total (or run out).
6. Fallback entries get `mention_count = 0`, `sources = ['blog:<post-slug>']`, and a small synthetic score so they sort below real trending hits but above nothing.
7. If we still have fewer than 5 after blog fallback, keep what we have (no previous-snapshot reuse).

## Files touched

- `supabase/functions/generate-trending-rappers/index.ts` — add `fetchBlogFallback()` helper and call it before the insert when `results.length < 5`. No schema or frontend changes.

## Out of scope

- Changing the frontend `TrendingRappersSection` (it already renders whatever rows the snapshot contains).
- Changing the cron schedule or scoring formula for primary results.
