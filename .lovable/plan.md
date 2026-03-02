

## Plan: Center-crop images in landscape format

### Change in `src/components/profile/ShareableTopFive.tsx`

Update the `backgroundPosition` in the mosaic cell renderer to use `'center center'` for landscape format instead of `'center top'`. This crops equally from top and bottom, showing more of the rapper's face rather than the top of their head/background.

- For landscape: `backgroundPosition: 'center center'`
- For portrait/square: keep `'center top'` (taller cells have enough room)

This is a one-line conditional change in the `renderMosaicCell` function where the background image div is rendered.

