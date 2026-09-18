# Restore the current homepage experience

## Outcome
The homepage will consistently show:

1. The official Spit Hierarchy logo
2. The **Latest Slick Talk** carousel
3. Featured Rankings whose five portraits match the actual leaders of each ranking

## Changes
- Preserve the verified homepage order: logo, Slick Talk carousel, then Featured Rankings.
- Change the carousel heading from **Featured Slick Talk** to **Latest Slick Talk**.
- Advance the app-shell cache version and update its cleanup script so every older homepage bundle and HTML cache is removed, including the currently configured version.
- Strengthen preview cache cleanup so unregistering an old service worker also clears its app-shell caches and performs one guarded refresh, preventing an already-controlled preview tab from continuing to display reverted code.
- Keep ranking portraits driven by the existing official-ranking preview function, which is verified to return published rappers in vote order. Version the homepage ranking query key so an old in-memory result cannot survive the recovery.

## Confirmed cause
- A real project revert occurred on July 20, temporarily restoring an older homepage revision; a follow-up commit restored the intended source.
- The current source, local preview, and published JavaScript bundle all contain the restored order and current ranking function, so the screenshot is not the version currently deployed.
- The stale screen was therefore an older JavaScript app shell still running in an already-open tab. That older shell used the prior homepage layout and ranking-item ordering while reading current database data, producing the mixed state shown in the screenshot.
- The cache revisions were advanced manually, but preview cleanup only unregisters service workers; it does not clear their existing caches or reload the already-running JavaScript. This leaves a path for an old tab to survive a revert-and-restore cycle.

## Future prevention
- Centralize the cache version so the app shell, page cache, image cache, and cleanup worker cannot drift across separate version strings.
- Add a deployed-version check that performs one safe refresh when the running bundle differs from the current release, while preserving the existing protection against refreshing during long blog reads.
- Add a homepage regression check for section order and the three ranking-card top fives before release.

## Verification
- Open the homepage in a clean browser and an existing-cache browser.
- Confirm the logo is first, **Latest Slick Talk** is second, and Featured Rankings is third.
- Compare each card’s five portraits with the live top-five results returned for Greatest of All Time, Lyrical Masters, and Rising Stars.
- Check desktop and mobile layouts and confirm the page does not enter a refresh loop.
- Confirm the latest build reports no errors.

## Technical details
- Frontend/PWA files only; no ranking votes or database records will be changed.
- The database preview function already filters to published rappers and sorts by weighted votes, then position and name for ties.
