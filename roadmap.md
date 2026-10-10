# Roadmap

- [x] Cloudflare access fixed (token works, route rebound). spithierarchy.com is now Active in Lovable (grey-cloud A records + TXT verified). BUT zone workers can never run on spithierarchy.com/www — Lovable serves those hostnames directly, bypassing the user's Cloudflare zone. Verified a worker DOES run on any non-Lovable hostname (ogtest test, since removed). Only remaining path for per-article share previews: blog articles on a subdomain (e.g. blog.spithierarchy.com) with the og-proxy worker intercepting crawlers and redirecting readers — awaiting user decision.
- [x] Make the album cover on review detail pages link to the album detail page.
- [ ] Finish ListenBrainz top-tracks: totals work (38/40 albums), token works, popularity API returns matches, but top_tracks still saves empty — debug the matching loop in fetch-listenbrainz-stats, remove debug instrumentation, then Playwright-verify AlbumListenStats on an album page.

- [x] On-site music player (YouTube matches + Spotify embed) and ListenBrainz top tracks
