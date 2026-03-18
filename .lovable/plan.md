

## Plan: Move name overlay to bottom + fix font rendering

### Problem
From the uploaded screenshots:
1. Rapper names are invisible — `html2canvas` is not rendering the Impact/Arial Black fonts in the overlay text
2. The header title ("USERNAME's Top 5") is also invisible for the same reason
3. The gradient overlay renders as a visible colored band but text within it doesn't appear

### Root cause
`html2canvas` struggles with certain font-family declarations. The `Impact` font in particular may not be available in the rendering context. Additionally, `fontWeight: 800` on Impact (which only has one weight) can cause rendering to fail silently.

### Changes in `src/components/profile/ShareableTopFive.tsx`

**1. Move gradient + rank + name from top to bottom of each cell**
- Change the overlay `position: absolute` from `top: 0` to `bottom: 0`
- Flip the gradient direction: `linear-gradient(to top, #000000CC 0%, #00000066 60%, #00000000 100%)`
- Align items to `flex-end` so content sits at the bottom
- Adjust padding accordingly (more padding at bottom, less at top)

**2. Fix font rendering for html2canvas**
- Simplify font stacks: use `Arial, Helvetica, sans-serif` with `fontWeight: 900` (these are universally available and html2canvas renders them reliably)
- Remove Impact from the stack — it's the likely culprit for silent rendering failures
- For the position badge number, keep the same approach since numbers ARE rendering (confirming the badge's simpler styling works)

**3. Header title — same font fix**
- Apply the same simplified font to the header `h1`

### No other files changed

