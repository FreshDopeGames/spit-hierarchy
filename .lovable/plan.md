## Goal

Fix the homepage top logo (rendered by `RankingsSectionHeader`, above Slick Talk): stop the top of the image getting clipped, and swap in a higher-resolution transparent source so it no longer looks pixelated when scaled up.

## Findings

- `src/components/RankingsSectionHeader.tsx` line 60 uses `h-full w-auto max-w-full object-contain scale-[1.85]`. The `scale-[1.85]` transform enlarges the rendered image, but the container has `overflow-hidden` (line 39), so the top/bottom of the scaled logo gets clipped. `max-w-full` also caps width before the scale kicks in on narrow viewports.
- `public/lovable-uploads/logo-header.png` (current src) is only **163×163** and RGBA-transparent — that's why it looks low-res when scaled ~1.85×.
- `public/lovable-uploads/Logo_Square_02.png` exists at **680×680** but has an opaque background (all four corners alpha=255), so it can't be dropped in as-is — it would clash with the gradient like the original logo did before we made a transparent version.

## Changes

1. Generate a transparent-background version of `Logo_Square_02.png` at 680×680, save as `public/lovable-uploads/logo-header-hd.png`. ~4× the resolution of the current source, same transparent look.
2. In `src/components/RankingsSectionHeader.tsx`:
   - Point `<img src>` at the new `logo-header-hd.png`.
   - Update `width`/`height` attrs to `680`/`680`.
   - Remove `max-w-full` (per your request) and the `scale-[1.85]` transform.
   - Size the logo directly with responsive height utilities so it fits without clipping: `h-[160px] sm:h-[220px] lg:h-[300px] w-auto object-contain`.
   - Keep alt text, `fetchPriority`, `loading`, `decoding` unchanged for SEO/perf.

## Out of scope

- No changes to container gradient, other homepage sections, or the global header logo.
- No service-worker bump (v7 already handles cache).
