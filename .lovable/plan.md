

## Plan: Add Delayed Wiggle Animation to "First Time Here?" Heading

### Changes

**`tailwind.config.ts`**: Add a `wiggle` keyframe and animation:
- Keyframe: subtle left-right rotation (`-3deg` → `3deg` → `0deg`) over a few cycles
- Animation class: `animate-wiggle` with a 0.5s duration

**`src/components/auth/AuthToggle.tsx`**:
- Add a state (`showWiggle`) that turns true after a 1-second `setTimeout`
- Conditionally apply the `animate-wiggle` class to the "First Time Here?" `<h2>` when `showWiggle` is true

### Files
- **Modify**: `tailwind.config.ts` — add wiggle keyframe + animation
- **Modify**: `src/components/auth/AuthToggle.tsx` — add delayed wiggle effect via `useState`/`useEffect`

