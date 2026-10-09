# Roadmap

- [ ] Reinspect Cloudflare access and live per-article social previews on spithierarchy.com. (Blocked: needs the new Cloudflare API token with Workers Scripts Read/Edit at account scope.)
- [x] Make the album cover on review detail pages link to the album detail page.
- [ ] Finish ListenBrainz top-tracks: totals work (38/40 albums), token works, popularity API returns matches, but top_tracks still saves empty — debug the matching loop in fetch-listenbrainz-stats, remove debug instrumentation, then Playwright-verify AlbumListenStats on an album page.
