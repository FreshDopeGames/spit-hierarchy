

## Plan: Mosaic-Style Share Image with Overlaid Names

Redesign the shareable image to match the reference — a tight, colorful mosaic where rapper avatars fill the entire space and names are overlaid on a shaded gradient at the top of each cell.

### Layout

```text
┌─────────────────────────────┐
│  LOGO  ·  username's Top 5  │  ← thin header bar
├─────────────────────────────┤
│                             │
│      #1 RAPPER IMAGE        │  ← full-width row, image fills cell
│      ┌─NAME──────────┐      │     name overlaid on dark gradient
│                             │
├──────────────┬──────────────┤
│  #2 IMAGE    │  #3 IMAGE    │  ← two equal columns
│  ┌─NAME──┐   │  ┌─NAME──┐   │
├──────────────┼──────────────┤
│  #4 IMAGE    │  #5 IMAGE    │
│  ┌─NAME──┐   │  ┌─NAME──┐   │
└──────────────┴──────────────┘
│    spithierarchy.com        │  ← thin footer
└─────────────────────────────┘
```

### Changes — `src/components/profile/ShareableTopFive.tsx`

**Remove** the current card-based `renderRapperCard` with badges, padded cards, and separate image/name columns.

**Replace with** a mosaic cell renderer:
- Each cell is a `position: relative` container where the rapper image is `object-fit: cover` filling 100% width and height
- Name is positioned at the **top** of the cell with a gradient overlay (`linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)`) — styled bold, uppercase, white text with a slight text shadow
- Position number badge sits in the top-left corner as a small gold circle overlay
- Empty slots show a dark placeholder with "—"

**Grid structure:**
- Header and footer are compact (fixed height, not flex-growing)
- The image grid takes all remaining space via `flex: 1`
- Row 1 (rapper #1) gets `flex: 2` height weight; rows 2 and 3 get `flex: 1.5` each — ensuring #1 is visually dominant but all rows are substantial
- Gap between cells: 4px (tight mosaic feel, like the reference)
- No outer padding around the grid — images go edge-to-edge within the card (small padding only on header/footer)
- Border-radius on corner cells only for the outer corners of the mosaic

**Dimensions stay the same** (1080x1080, 1080x1920, 1200x630). The mosaic naturally fills all orientations since it's flex-based.

**Color usage:**
- Gold (`hsl(45 85% 55%)`) for the position badge, header text, and footer
- The images themselves provide the color/vibrancy — no card backgrounds needed
- Name overlay gradient: black to transparent from top

### No changes to `ShareTopFiveModal.tsx`

The modal scaling logic remains as-is since only the inner content changes.

