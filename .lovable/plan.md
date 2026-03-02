

## Plan: Fix Share Top 5 — Fonts, Image Quality, Gradient, and Landscape Crop

### Problems identified

1. **Fonts not rendering**: CSS variables (`var(--theme-font-heading)`) don't resolve inside `html2canvas` — it renders an offscreen iframe that doesn't inherit computed CSS variable values, so all text falls back to `system-ui` which renders as generic sans-serif with no visual weight.
2. **Low-res images**: The share card uses `slot.rapper.image_url` which comes from the legacy `rappers.image_url` column (low-res thumbnails). The high-res images live in `rapper_images` table and are accessed via `getRapperImageUrl(basePath, 'xlarge')`.
3. **Gradient overlay not rendering**: The `linear-gradient` text overlay uses `rgba()` which `html2canvas` sometimes struggles with.
4. **Landscape crop too centered**: Needs `center 35%` instead of `center center` to show rapper's eyes.

### Changes

#### 1. `src/components/profile/ShareableTopFive.tsx` — Use hardcoded bold fonts

Replace all `var(--theme-font-heading)` and `var(--theme-font-body)` references with explicit, bold, universally-available system fonts that `html2canvas` can render reliably:

- Headings/names: `fontFamily: "'Impact', 'Arial Black', 'Helvetica Neue', sans-serif"`
- Body/footer: `fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif"`

These are bold, high-impact fonts available on all platforms and render correctly in `html2canvas`.

#### 2. `src/components/profile/ShareableTopFive.tsx` — Landscape crop position

Change `backgroundPosition` from `'center center'` to `isLandscape ? 'center 35%' : 'center center'` — this shifts the crop point ~15% above center, ensuring rapper eyes/face are visible in the shorter landscape cells.

#### 3. `src/components/profile/ShareTopFiveModal.tsx` — Resolve high-res images before rendering

Before passing slots to `ShareableTopFive`, resolve each rapper's image to the high-res `xlarge` URL using `getRapperImageUrl` from the `rapper_images` table:

- Import `useRapperImages` batch hook from `useImageStyle`
- Extract rapper IDs from slots
- Fetch `xlarge` size images in batch
- Map the resolved high-res URLs into the slots before passing to `ShareableTopFive`

This ensures the share card uses the highest-quality comic_book style images.

#### 4. `src/components/profile/ShareableTopFive.tsx` — Fix gradient overlay

Replace `rgba(0,0,0,0.75)` gradient with simpler opacity approach or ensure the gradient syntax is `html2canvas`-compatible by using hex-with-alpha format (`#000000BF`) which `html2canvas` handles more reliably.

### Files changed
- `src/components/profile/ShareableTopFive.tsx`
- `src/components/profile/ShareTopFiveModal.tsx`

