

## Plan: Add "Share Rapper" Button to Rapper Detail Header

### What
Add a share button below the "Rate Skills" button (both desktop and mobile versions) that copies the rapper's profile URL to the clipboard, using the Web Share API when available.

### Changes

**File: `src/components/rapper/RapperHeader.tsx`**

1. Import `Share2` from `lucide-react` and `toast` from `sonner`
2. Add a `handleShare` function that:
   - Uses `navigator.share()` if available (mobile native share sheet) with title, text, and URL (`/rapper/${rapper.slug}`)
   - Falls back to `navigator.clipboard.writeText()` with a toast confirmation
3. Add a "Share" button directly below each "Rate Skills" button (both the desktop version under the avatar at ~line 82, and the mobile version at ~line 103), styled as a secondary/outline button to visually distinguish it from the primary gold CTA

### Button placement
- **Desktop**: Below "Rate Skills" under the avatar (after line 82)
- **Mobile**: Below the mobile "Rate Skills" button (after line 103)

### Styling
- Outline/secondary style: border with theme primary color, transparent background, theme-colored text
- Same width as the Rate Skills button for visual alignment
- No pulse animation (reserved for the primary CTA)

