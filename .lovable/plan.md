

# Top 5 Performance Optimizations for Spit Hierarchy

## 1. Code-split all page routes with React.lazy

**Impact: High (reduces initial JS bundle ~40-60%)**

Currently, all 20+ page components are eagerly imported in `App.tsx`. Only `Index.tsx` and `RapperDetail.tsx` use `lazy()` internally for below-fold sections. Every page (Admin, Blog, Quiz, Analytics, etc.) ships in the main bundle even if the user never visits them.

**Change:** Wrap every `Route` element's page import with `React.lazy()` and a `Suspense` fallback in `App.tsx`. This is the single highest-impact optimization available.

## 2. Remove global Leaflet CSS import from main.tsx

**Impact: Medium (eliminates ~30KB of render-blocking CSS from every page)**

`import "leaflet/dist/leaflet.css"` is loaded in `main.tsx` for every user on every page, but Leaflet maps only appear on 2 analytics sub-components (`CityMap.tsx`, `VoterActivityMap.tsx`). Those files already import the CSS themselves.

**Change:** Remove the `import "leaflet/dist/leaflet.css"` line from `main.tsx`. The two map components already handle their own import.

## 3. Defer non-critical global components (VoterGeolocationTracker, ActivityToastProvider)

**Impact: Medium (faster time-to-interactive)**

`VoterGeolocationTracker` and `ActivityToastProvider` render on every page load and run Supabase queries / subscriptions immediately — even for unauthenticated users. `UsernameEnforcementModal` also mounts globally.

**Change:** Wrap these three components in a single lazy-loaded wrapper that only mounts after the app is interactive (e.g., via `requestIdleCallback` or a short delay), and gate them behind `user` being present so they don't fire queries for logged-out visitors.

## 4. Add Supabase query result deduplication via queryKey consistency

**Impact: Medium (reduces redundant network requests)**

With 43 hook files making `useQuery` calls, many share overlapping data (e.g., rapper details fetched by ID in multiple contexts). The `useOptimizedQuery` hook exists but is never actually used — all hooks call `useQuery` directly, bypassing its network-aware and priority-based optimizations.

**Change:** Audit the top 5-10 most frequently called hooks and either (a) adopt `useOptimizedQuery` for low-priority/background queries, or (b) consolidate duplicate queryKeys so React Query's built-in dedup prevents redundant fetches. No new dependencies needed.

## 5. Remove the no-op AppInitializer component

**Impact: Low (cleaner boot path, removes unnecessary DOM work)**

`AppInitializer` runs on every page load but does nothing useful at runtime — it logs security headers to the console (which can't actually set HTTP headers from client JS) and adds meta tags that are already in `index.html`. It adds an extra React component layer and useEffect for zero benefit.

**Change:** Delete `AppInitializer.tsx` and remove it from `App.tsx`. Move the dev-only perf logging to `performanceCleanup.ts` if desired.

---

**None of these changes touch authentication, RLS policies, database access patterns, or any security-related code.** They are purely frontend load-time and runtime optimizations.

