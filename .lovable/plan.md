## What I found

- No rapper detail URL I inspected via the Google Search Console API is actually blocked. `/rapper/one-be-lo`, `/rapper/kendrick-lamar`, `/rapper/eminem` all report **verdict PASS / INDEXING_ALLOWED / Submitted and indexed**.
- Source code confirms it: `RapperDetail.tsx` renders `SEOHead` without a `robots` prop, and `ContentSecurityPolicy.tsx` explicitly injects `<meta name="robots" content="index, follow">` on every page. The static `index.html` also has no `noindex`.
- The only routes that intentionally emit `noindex, nofollow` are `Auth`, `Analytics`, `Notifications`, `UserProfile`, and `NotFound` — none of these are the rapper detail route.

So the specific "noindex on One Be Lo" line item in your GSC Page Indexing report is a stale row (Google keeps historical exclusion buckets around long after the underlying page changes). The current live page is indexable, and Google itself confirms that.

## What I want to fix anyway

Even though there is no active `noindex` on rapper pages, two real gaps could plausibly show up as noindex/soft-404-adjacent findings in GSC for rapper URLs and are worth closing:

1. **Rapper "Not Found" fallback returns HTTP 200 with the default site title and no `noindex`.** If Google ever hits a stale slug (renames, deleted rappers, old UUID links), it sees a 200 page that looks like the homepage — a classic soft-404 / duplicate-content trigger. It should emit `noindex, nofollow` via `SEOHead` so Google drops it cleanly.
2. **`NotFound.tsx` already sets noindex, but the SPA rewrites everything to `index.html`, so Googlebot's first paint is the static head from `index.html`.** For robots directives, this is fine — Google renders JS and picks up `SEOHead`'s meta — but any per-route canonical/`og:url` set only via Helmet also depends on rendering. This is not a noindex bug, but I'll note it in the response so we're not chasing ghosts later.

## Plan

1. **Add `robots="noindex, nofollow"` to the "Rapper Not Found" branch of `src/pages/RapperDetail.tsx`** by mounting a `SEOHead` at the top of that branch (title "Rapper Not Found | Spit Hierarchy", robots noindex, canonical omitted). This prevents any stale-slug URL from being counted as an indexable rapper page.
2. **Verify with the Google URL Inspection API** on 3–5 rapper URLs (including one-be-lo) after deploy that verdict remains PASS.
3. **In GSC** (manual step for you): open the Page Indexing report → "Excluded by 'noindex' tag" bucket → click **Validate Fix**. Google will re-crawl the flagged URLs; the stale rows will move to Indexed within a few days.
4. Optional: request re-indexing of `/rapper/one-be-lo` via GSC URL Inspection → "Request indexing" to force a fast re-check.

## Files to modify

- `src/pages/RapperDetail.tsx` — add a `<SEOHead robots="noindex, nofollow" title="Rapper Not Found | Spit Hierarchy" />` inside the `if (!rapper)` block.

## Verification

- After deploy, call GSC URL Inspection on `/rapper/one-be-lo` and confirm verdict PASS, indexingState INDEXING_ALLOWED.
- Confirm the "Not Found" state now renders `<meta name="robots" content="noindex, nofollow">` in DevTools.
- Confirm valid rapper pages still render `<meta name="robots" content="index, follow">` (from `ContentSecurityPolicy`).
