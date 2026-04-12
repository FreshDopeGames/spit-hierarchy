

## Fix VS Detail Page Vote Distribution Bar

**Problem**: Currently using `* 200` multiplier which makes 50/50 fill both sides completely. User wants each side to directly represent the rapper's percentage of total votes — so 50/50 = half-filled on each side, 30/70 = 30% left / 70% right.

### Change

**File**: `src/pages/VSMatchDetail.tsx` (lines 330, 334)

Replace the `* 200` formula with `* 100`:
- Line 330: `width: ${(rapper_1_votes / total_votes) * 100}%` — rapper 1's percentage directly fills that proportion of the left half
- Line 334: `width: ${(rapper_2_votes / total_votes) * 100}%` — same for right half

**Result**:
- 1v1 (50/50): each green bar fills 50% of its half
- 30/70: left bar fills 30% of its half, right fills 70%
- 100/0: winning side completely fills its half, losing side empty

Only the detail page is changed per the request. The listing page keeps the current behavior.

