

## Plan: Redesign Share Your Top 5 Experience

### Problems identified
1. **Layout**: #1 rapper should span the full top row, then two rows of 2 rappers each (#2-3, #4-5)
2. **Colors**: Using hardcoded `gray-800`, `yellow-400`, `gray-900` instead of the site's theme variables (gold primary `--theme-primary: 45 85% 55%`, dark background `--theme-background: 0 0% 5%`, surface `--theme-surface: 0 0% 17%`)
3. **Logo missing**: No site logo in the shareable image — add the Spit Hierarchy logo at the top
4. **Horizontal scroll bug**: The modal preview container renders the full-resolution image (1080px+) with only `overflow-hidden` on the inner wrapper but the scaled container doesn't constrain its layout box properly, causing horizontal overflow on the dialog

### Changes

#### 1. `src/components/profile/ShareableTopFive.tsx` — Full rewrite of layout + theming

**New layout (all formats):**
```text
┌──────────────────────────────┐
│         [LOGO]               │
│     USERNAME'S TOP 5         │
│  "My favorite rappers ranked"│
│                              │
│  ┌──────────────────────┐    │
│  │   #1  [IMAGE] NAME   │    │  ← Full width featured row
│  └──────────────────────┘    │
│  ┌──────────┐ ┌──────────┐   │
│  │ #2 IMG   │ │ #3 IMG   │   │  ← Row of 2
│  └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐   │
│  │ #4 IMG   │ │ #5 IMG   │   │  ← Row of 2
│  └──────────┘ └──────────┘   │
│                              │
│     spithierarchy.com        │
└──────────────────────────────┘
```

- Replace all hardcoded colors with theme HSL variables:
  - Background: `hsl(var(--theme-background))` / `hsl(var(--theme-backgroundDark))`
  - Cards: `hsl(var(--theme-surface))`
  - Borders/badges: `hsl(var(--theme-primary))` (the gold)
  - Text: `hsl(var(--theme-text))`, `hsl(var(--theme-textMuted))`
  - Radial glow: use `--theme-primary` instead of `#ffd700`
- Add site logo image at the top (`/lovable-uploads/logo-header.png`)
- #1 rapper card spans full width with larger image
- #2-5 in a 2-column grid across two rows
- Footer text: "spithierarchy.com" or "Spit Hierarchy"

#### 2. `src/components/profile/ShareTopFiveModal.tsx` — Fix horizontal scroll + preview scaling

- Wrap the preview in a container that uses `transform-origin: top center` with proper width/height constraints so the scaled content doesn't cause overflow
- Set the container's actual CSS dimensions to the scaled size (e.g., `width * scale`, `height * scale`) so the parent layout respects the visual size
- Remove any source of horizontal overflow — the preview div should have explicit max-width and the parent should use `overflow: hidden`

