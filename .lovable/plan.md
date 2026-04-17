

## Root Cause

Both issues share one root cause: **the PWA service worker is stuck in "waiting" state** on the live site / installed PWA.

- `vite.config.ts` uses `registerType: 'autoUpdate'`
- No in-app prompt calls `skipWaiting()`, so a new SW downloads in the background but **only activates after every tab/PWA window closes**
- On an installed PWA (home screen), the window rarely fully closes → old `index.html` + old JS bundle keep serving → fixes appear "reverted"
- The previous `cacheId: 'spit-hierarchy-v2'` bump *will* eventually clear caches, but only **after** the new SW activates — which is the same blocked step

The Skill Ratings count being 0 was a separate RLS issue (already fixed via migration) but is part of the same backend story that the user can't see until the SW updates.

## Fix: Force the New Service Worker to Activate Immediately

Two coordinated changes in `vite.config.ts` plus a tiny SW registration hook:

**1. `vite.config.ts` — workbox options**
- Add `skipWaiting: true` and `clientsClaim: true` so the new SW takes control of all open clients on install instead of waiting

**2. `src/main.tsx` — explicit registration with auto-reload**
- Import `registerSW` from `virtual:pwa-register`
- On `onNeedRefresh`, immediately call the update function and reload the page once
- This guarantees that even if a cached client is open, it picks up the new bundle on next reload (no manual "close all tabs" required)

**3. Add a TypeScript declaration for `virtual:pwa-register`**
- Create `src/vite-env.d.ts` reference (or extend existing) so the import compiles

## What This Gives Users

- Next publish → next visit → new SW activates immediately and reloads
- After this fix is deployed once, all future updates propagate automatically with no stale-content "reverts"
- Existing cached image entries (Supabase `CacheFirst`) will be naturally re-fetched as the new SW takes over

## Files to Change

- `vite.config.ts` — add `skipWaiting: true`, `clientsClaim: true` to `workbox`; bump `cacheId` to `spit-hierarchy-v3`
- `src/main.tsx` — register SW with auto-reload on update
- `src/vite-env.d.ts` — add `/// <reference types="vite-plugin-pwa/client" />` if missing

## After Deploy

1. User publishes the update
2. Next time they (or any user) opens the site or PWA, the new SW installs, immediately claims the page, and reloads — they see the fixes right away
3. No manual cache clear, no "close the PWA" dance needed

## Note on the Top 5 Mosaic

The mosaic code in `RankingPreviewCard.tsx` is correct — it always renders 5 cells (real images + placeholders for missing ones). If after the SW fix the user still sees gaps on specific rankings, that means those `ranking_items` rows have fewer than 5 entries in the DB, which is a content/data question we can investigate separately.

