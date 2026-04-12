

## Fix VS Vote Distribution Bar for Ties

**Problem**: The current "advantage from center" bar math breaks on ties. When votes are equal (e.g., 1v1), the formula `(rapper_2_votes / total_votes) * 50` = 25%, creating a bar from 25%–50% that falsely shows rapper 1 winning.

**Solution**: Replace the single green "advantage" bar with a proper tug-of-war split bar — two colored halves (one per rapper) that fill proportionally. The gold center divider stays as the 50/50 reference line.

### Visual Behavior
- **Tie (1v1)**: Each rapper's color fills exactly half. Divider sits at center — balanced.
- **Advantage (3v1)**: Left rapper's color fills 75%, right fills 25%. Divider still marks center to show how far past 50/50 the leader has pulled.
- **Zero votes**: Bar hidden (existing behavior).

### Files to Edit

1. **`src/pages/VSMatches.tsx`** (lines 150–160) — Replace the single green advantage bar with two bars:
   - Left bar: rapper 1's share (`rapper_1_votes / total_votes * 100%` width), colored e.g. green.
   - Right bar: fills remainder, colored e.g. amber/orange.
   - Gold center divider stays as the 50% reference.

2. **`src/pages/VSMatchDetail.tsx`** (lines 324–344) — Same change for the detail page's larger distribution bar.

### Colors
- Rapper 1 side: `bg-green-600`
- Rapper 2 side: `bg-amber-600`
- Center reference line: `bg-yellow-500` (unchanged)

