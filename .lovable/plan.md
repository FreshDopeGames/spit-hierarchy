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

## Verification
- Open the homepage in a clean browser and an existing-cache browser.
- Confirm the logo is first, **Latest Slick Talk** is second, and Featured Rankings is third.
- Compare each card’s five portraits with the live top-five results returned for Greatest of All Time, Lyrical Masters, and Rising Stars.
- Check desktop and mobile layouts and confirm the page does not enter a refresh loop.
- Confirm the latest build reports no errors.

## Technical details
- Frontend/PWA files only; no ranking votes or database records will be changed.
- The database preview function already filters to published rappers and sorts by weighted votes, then position and name for ties.
