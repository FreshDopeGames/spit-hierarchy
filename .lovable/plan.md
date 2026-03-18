

## Diagnosis

### Issue 1: Tabs rendering in a single column on desktop
The Admin page uses **dynamic Tailwind classes** like `` grid-cols-${row1.length} `` (line 126, 133). Tailwind purges classes that aren't statically present in source code at build time. So `grid-cols-8`, `grid-cols-7`, etc. are never generated — the grid falls back to `grid-cols-1`, stacking all tabs vertically.

The safelist in `tailwind.config` is empty, so nothing rescues these classes.

### Issue 2: "Users" tab missing
The `Users` tab is defined with `roles: ["admin"]` and will only appear if `useSecurityContext().isAdmin` is `true`. Since the tab layout is broken (all tabs in one column), it's possible the Users tab is simply scrolled out of view. However, if `is_admin` RPC is returning false for your session, the tab genuinely won't render. The most likely cause is the layout issue making it hard to find.

## Plan

### Fix 1: Replace dynamic grid classes with static ones
In `src/pages/Admin.tsx`, replace the dynamic `grid-cols-${row1.length}` template literals with a helper that maps to static, full Tailwind class strings. For example:

- Use a lookup object or conditional that outputs literal strings like `"grid-cols-8"`, `"grid-cols-7"`, etc.
- Alternatively, hardcode two rows with fixed column counts (e.g., row 1 = 8 tabs → `grid-cols-8`, row 2 = 7 tabs → `grid-cols-7`).
- Simplest approach: add all needed `grid-cols-*` values to the Tailwind safelist, but the cleaner fix is using static class names.

### Fix 2: Verify Users tab visibility
After fixing the grid layout, the Users tab should appear for admin users. No code change needed for this — it's a consequence of the broken grid making tabs invisible or hard to find.

**Files to modify:** `src/pages/Admin.tsx` (replace 2 dynamic class interpolations with static class mappings).

