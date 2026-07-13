## Verify Top 5 Share Output

Drive the profile page via Playwright, open the Share Top 5 modal, and for each format (portrait, square, landscape):

1. Screenshot the in-modal preview.
2. Click Download, intercept the generated PNG (via `page.on("download")`), save it.
3. Compare preview screenshot vs downloaded PNG side-by-side — check:
   - Rapper avatars render (not blank/placeholders)
   - No horizontal/vertical stretching (aspect matches source photos)
   - Position badges align with names
   - Fonts match site theme (Mogra headings, Merienda body)
   - Header logo + username render

4. Report findings with screenshots. If any format shows stretching or a mismatch, propose a targeted fix in `ShareableTopFive.tsx` (likely `objectFit`/`objectPosition` or cell flex ratios).

### Technical notes
- Use restored Supabase session (`LOVABLE_BROWSER_AUTH_STATUS=injected`) to reach `/profile`.
- Save all artifacts under `/tmp/browser/top5-verify/`.
- No code changes unless verification uncovers a defect.
