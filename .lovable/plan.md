

## Plan: Fix Copy Button UX

### Problem
`navigator.clipboard.write()` with image blobs fails in most contexts because the async `html2canvas` rendering breaks the "user gesture" requirement browsers enforce for clipboard write access. This isn't fixable without a fundamentally different approach.

### Solution
Replace the current copy behavior with a **fallback strategy**:

1. **Try clipboard write** first (works in Chrome on desktop with recent user gesture)
2. **On failure**, fall back to downloading the image automatically instead of showing an error
3. Show a toast: *"Clipboard not supported — image downloaded instead"*

### Change in `src/components/profile/ShareTopFiveModal.tsx`

Update the `copy` branch inside `generateImage`:
- Wrap the clipboard write in try/catch
- On catch, trigger the download flow as fallback
- Replace the error toast with a friendly info toast explaining the fallback

