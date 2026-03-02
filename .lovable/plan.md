

## Plan: Center-crop all formats + activate theme fonts

### Changes in `src/components/profile/ShareableTopFive.tsx`

**1. Center-crop all orientations**
- Line 69: Change `backgroundPosition: isLandscape ? 'center center' : 'center top'` → `'center center'` for all formats

**2. Activate theme fonts**
- Line 147: Root container `fontFamily` → `'var(--theme-font-body)'`
- Line 169-175: Header title `fontFamily` → `'var(--theme-font-heading)'`
- Line 116-131: Rapper name overlay `fontFamily` → `'var(--theme-font-heading)'`
- Line 216-223: Footer `fontFamily` → `'var(--theme-font-body)'`

### No other files changed

