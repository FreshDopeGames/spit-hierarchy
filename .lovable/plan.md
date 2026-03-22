

## Plan: Square & Portrait Format Options for Share Quote Modal

### Overview
Add format selection (Square 1080x1080 for posts, Portrait 1080x1920 for stories) to the existing `ShareQuoteModal`, letting users pick the right size before downloading/copying.

### Changes to `src/components/rapper/ShareQuoteModal.tsx`

**Add format selector**: Two toggle buttons ("Square" and "Portrait") above the preview, styled with theme colors. Default to Square.

**Format configurations**:
- **Square** (1080x1080): Avatar 160px, quote font 36px, more compact vertical spacing
- **Portrait** (1080x1920): Avatar 200px, quote font 40px, more vertical breathing room, content vertically centered

**Rendering approach** (follows existing ShareTopFiveModal pattern):
- Two hidden export refs (one per format), each rendered at full resolution off-screen (opacity 0, zIndex -9999, position absolute)
- The visible preview scales down whichever format is selected using transform scale
- Generate image from the hidden full-size ref for the selected format

**Preview scaling**: 
- Square preview: scale 320/1080 inside a 320x320 container
- Portrait preview: scale 280/1080 inside a ~280x497 container (to fit the dialog)

**Download filename**: includes format suffix, e.g. `big-sean-quote-square.png`

### Files
- **Modify**: `src/components/rapper/ShareQuoteModal.tsx`

