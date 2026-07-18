Replace the title/subtitle text inside `RankingsSectionHeader` with the official Spit Hierarchy logo rendered at roughly 10-15% of the viewport height. Use the existing `/lovable-uploads/logo-header.png` asset and set `alt="Spit Hierarchy: Goat Rapper Rankings"` for SEO.

Technical details:
- File to change: `src/components/RankingsSectionHeader.tsx`
- Remove the Crown/TrendingUp icons, the `<h1>` title, and the subtitle paragraph.
- Replace the centered content with an `<img>` of `/lovable-uploads/logo-header.png`.
- Size the logo responsively using a height class around `h-[10vh]` to `h-[15vh]` (with `max-h` and `w-auto`) so it scales with page height without overflowing.
- Keep the outer rounded container and background gradient/image for visual continuity, but remove the text-readability overlay since text is no longer present.
- Preserve the `section_headers` query so admins can still toggle the section active/inactive via the existing CMS row; only the rendering changes.
- Verify the homepage renders correctly in mobile and desktop preview.