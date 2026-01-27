
# Fix "Storytelling" Label Cutoff on Artistry Radar Chart

## Problem

The "Storytelling" skill label on the Artistry radar chart is being cut off on the left edge on desktop. This happens because the chart's left margin (currently 60px) isn't providing enough space for the full label width when it's positioned with `textAnchor="end"`.

## Solution

Increase the left margin of the Artistry radar chart from 60px to 80px to provide adequate space for the "Storytelling" label.

## File to Modify

**`src/components/rapper/RapperAttributeStats.tsx`** (line 299)

### Change

```typescript
// Before (line 299)
<RadarChart data={artistry} margin={{ top: 40, right: 50, bottom: 25, left: 60 }}>

// After
<RadarChart data={artistry} margin={{ top: 40, right: 50, bottom: 25, left: 80 }}>
```

## Why This Works

- Labels on the left side of radar charts use `textAnchor="end"`, meaning text extends leftward from the anchor point
- "Storytelling" is a longer word that needs more horizontal space than shorter labels
- Increasing the left margin from 60px to 80px (adding ~20px) provides the extra clearance needed
- This change only affects the Artistry chart where the issue occurs; the Technique chart margin remains at 50px since its left-side labels ("Technical Skill", "Performance") are not clipped
