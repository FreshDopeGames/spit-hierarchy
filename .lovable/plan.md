

## Plan: Shareable Best Quote Card with Share Button

### 1. Update `RapperBestQuote.tsx` — Fix Card Styling + Add Share Button

**Card styling fix**: Replace gradient background with `bg-black` and `border-[hsl(var(--theme-primary))]` (4px solid from ThemedCard base) to match the standardized card pattern.

**Add Share button**: A small themed button (Share2 icon) in the top-right corner of the card. Clicking opens a modal to download/copy the quote as an image.

### 2. Create `ShareQuoteModal.tsx`

A modal dialog with:
- A hidden export ref (same pattern as `ShareTopFiveModal`) rendered at full size but visually hidden
- The shareable card contains:
  - Black background with primary color border
  - Rapper's rounded-square avatar image (top, centered)
  - Large quotation marks + the quote text in italic
  - Rapper name attribution below
  - Small "spithierarchy.com" watermark at bottom
- Two action buttons: **Download** and **Copy to Clipboard**
- Uses `html2canvas` (already a dependency) to generate the image

### 3. Props Flow

`RapperDetail` passes `rapper.top_quote`, `rapper.name`, `rapper.id`, `rapper.slug` to `RapperBestQuote`.
`RapperBestQuote` manages modal open state and passes data to `ShareQuoteModal`.
`ShareQuoteModal` uses `useRapperImage(rapperId, 'xlarge')` to get the avatar for the export.

### Files
- **Modify**: `src/components/rapper/RapperBestQuote.tsx`
- **Modify**: `src/pages/RapperDetail.tsx` (pass additional props)
- **Create**: `src/components/rapper/ShareQuoteModal.tsx`

