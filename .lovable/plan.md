## Goal

Make the Spit Hierarchy logo in the homepage header roughly 2× larger across all breakpoints and remove the excess top/bottom empty space visible in the screenshot.

## Diagnosis

`src/components/RankingsSectionHeader.tsx` currently sizes the container at `h-[10vh] sm:h-[12vh] lg:h-[15vh]`. The `<img>` has a square 163×163 intrinsic size scaled with `w-full h-full object-contain`, so on a wide/short container the logo scales down to the container height (small), and the leftover horizontal space reads as padding around it. On mobile (screenshot: 384×715, container ≈71px tall) the logo renders far smaller than the whitespace suggests it should.

Regarding preview vs live: the source now matches the "logo-only" version — no reverted text is in the code. Any lingering visual difference between preview and the published site at spit-hierarchy.lovable.app is the same service-worker cache lag we've handled before (last bumped to v7). No code revert occurred; this plan only addresses sizing.

## Changes

Single file: `src/components/RankingsSectionHeader.tsx`

1. Increase the container height to roughly double: `h-[20vh] sm:h-[24vh] lg:h-[30vh]` with a sensible `min-h-[160px]` so short viewports still render it large enough.
2. Remove the residual bottom fade div (`h-4` gradient) since it's contributing to visual "padding" beneath the logo and no longer needed with the transparent PNG.
3. Keep `object-contain` so the logo never distorts, but wrap the `<img>` in a flex container with zero padding (already the case) and let it fill height — width will scale proportionally.
4. Keep the transparent-PNG src, alt text, and SEO attributes unchanged.

## Out of scope

- No changes to `Index.tsx` ordering or other homepage sections.
- No service-worker bump; the current v7 handler is already in place from the prior turn.
