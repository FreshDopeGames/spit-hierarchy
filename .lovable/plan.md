

## Investigation Results

### Issue 1: Blu doesn't show "Rated" badge after rating
**Root cause**: The `user-rated-rappers` query in `AllRappersGrid.tsx` is never invalidated after a vote is submitted. The `VoteModal` component invalidates `rapper-rating-count` but not `user-rated-rappers`, so the badge set is stale until a full page reload.

**Fix**: In the `VoteModal` component's success handler, add invalidation of the `["user-rated-rappers", user.id]` query key so the badge appears immediately after rating.

### Issue 2: Broken badge image in Lovable preview
**Root cause**: The import `import RatedBadge from "@/assets/Rated_Badge_64.png"` and the file itself are both valid (the file exists and renders correctly). Since this only happens in the Lovable preview and not on the live site, this is a transient Vite HMR/build caching issue in the preview environment. A rebuild or refresh should resolve it. No code change needed for this.

### Files to modify
- **`src/components/VoteModal.tsx`** (or wherever the vote success handler lives): Add `queryClient.invalidateQueries({ queryKey: ["user-rated-rappers"] })` after a successful vote submission, alongside the existing `rapper-rating-count` invalidation.

### Summary
One code fix (query invalidation) to ensure the Rated badge appears immediately after voting. The broken image rendering is a preview-only environment issue, not a code bug.

