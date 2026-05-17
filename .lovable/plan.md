# Top Rappers By Category — Featured #1 Layout

Give the #1 rapper in each category visual prominence inside the "Top Rappers by Category" card on the Analytics page, with a different layout per breakpoint while rappers #2–#5 keep the existing compact card look.

## Per-breakpoint layout

Mobile (`< sm`, < 640px)
- #1 rendered as a full-width featured card spanning the column.
  - Large square avatar (e.g. `h-40`) centered with name, Trophy icon, avg-rating badge, and ratings count centered beneath.
- #2–#5 stacked in four separate full-width rows, each using the current small card look (12×12 avatar on the left, name + badge on the right).

Tablet (`sm` to `< lg`, 640–1023px)
- Two-column row: #1 on the left as a larger featured card (bigger avatar, centered text), #2–#5 on the right as a 2×2 grid of the existing compact cards.

Desktop (`lg+`, ≥ 1024px)
- #1 as a centered featured card on its own row (constrained max width so it doesn't stretch awkwardly, e.g. `max-w-sm mx-auto`), with a larger avatar and centered text.
- #2–#5 below as a single row of 4 compact cards.

## Technical notes

- Edit only `src/components/analytics/TopRappersByCategoryCard.tsx`.
- Split the existing `<Link>` map into two presentational sub-components inside the same file (file-scoped, per project rule against remounts): `FeaturedRapperCard` for #1 and `CompactRapperCard` for #2–#5. Both reuse the existing `RapperAvatarItem` for the image.
- Use static Tailwind classes only (project rule: no dynamic grid classes). Structure per category:
  - Outer wrapper: `<div className="space-y-3">` with the existing `<h4>` heading.
  - Layout container uses `flex flex-col sm:flex-row lg:flex-col gap-3`:
    - On mobile: column → featured on top, then compact list.
    - On tablet: row → featured left, 2×2 grid right (`sm:w-1/2 lg:w-full` for each half).
    - On desktop: column → featured row, then 4-up row.
  - Compact list container: `flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4`.
- Featured card styling: same border/hover treatment as compact card but larger padding, centered content, larger avatar (`h-32 w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40`), Trophy + name on one centered line, badge and ratings count centered below.
- Update the loading skeleton to mirror the new structure (one featured skeleton + four compact skeletons per category).
- No data, hook, or query changes — pure presentational refactor.

## Out of scope

- No changes to `useTopRappersByCategory`, ranking logic, or any other analytics card.
- No new colors or design tokens.
