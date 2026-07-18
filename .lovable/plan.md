## Plan

### Goal
Update the homepage rankings section header so the logo’s black areas blend into the gray background instead of clashing, and scale the logo to fill the available header space with no extra padding.

### Current state
- `src/components/RankingsSectionHeader.tsx` renders `/lovable-uploads/logo-header.png` inside a padded container.
- The image is sized by height only (`h-[10vh] ... w-auto`), leaving unused horizontal space and making it look small.
- The background is a gradient over a gray/carbon surface; the logo’s solid black portions create a hard edge.

### Proposed changes
1. **Remove container padding** around the logo so it can occupy the full header area.
2. **Size the image to fill the div** using `w-full h-full object-contain` instead of the current height-only responsive classes.
3. **Apply a CSS blend mode** to make the black portions of the logo disappear into the background.
   - Primary candidate: `mix-blend-screen` — pure black becomes transparent, lighter colors remain visible.
   - Fallback candidate: `mix-blend-lighten` — keeps the lighter of the base and blend pixels, which also hides black.
   - If the logo uses near-black for text/details that must stay opaque, we’ll test `mix-blend-overlay` or add a slight brightness filter first.
4. **Verify visually** in the preview at desktop and mobile widths.

### Files to modify
- `src/components/RankingsSectionHeader.tsx`

### Verification
- Screenshot the header at 1265px and mobile widths.
- Confirm black edges are gone and the logo remains legible.
- Confirm the logo touches the container edges with no leftover padding.