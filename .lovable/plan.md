

## Plan: Optimize Share Card Layout and Image Sizes

### Changes to `src/components/profile/ShareableTopFive.tsx`

**1. Center the #1 featured card**
- Add `justifyContent: 'center'` and `maxWidth: '80%'` (or similar) with `margin: '0 auto'` to the featured card wrapper so it sits centered rather than spanning edge-to-edge.

**2. Dramatically increase avatar sizes**
- Current sizes are too small (portrait: 140/110, square: 120/90, landscape: 80/60)
- New sizes:
  - **Portrait**: featured 220px, grid 160px
  - **Square**: featured 180px, grid 130px  
  - **Landscape**: featured 110px, grid 80px
- This makes the card much more visual/image-forward

**3. Make rows stretch to fill in portrait mode**
- Add `flex: 1` to each row container (the featured row div and each 2-up row div) when in portrait mode, so they evenly distribute the vertical space
- Cards within rows also get `flex: 1` in the cross-axis direction with `alignItems: 'stretch'`

**4. Grid cards fill their row**
- The 2-up row cards already have `flex: 1` but need `alignSelf: 'stretch'` and the row containers need `alignItems: 'stretch'` so cards expand vertically to fill the row height in portrait

### No other files changed

