

## Fix Duplicate "United States" and Adjust Dropdown Colors

### Issues to Fix
1. **Duplicate "United States"** - The country appears twice (once in `PRIORITY_US_LOCATIONS`, once in `COUNTRIES`)
2. **Subheader color** - Group labels should be gray, not faded primary
3. **Keep list items** as primary color (already correct)

### Changes Needed

**File: `src/components/analytics/GeographicFilter.tsx`**

1. Filter out "United States" from the COUNTRIES render (since it's already in priority list)
2. Change `ThemedSelectLabel` classes from `text-[hsl(var(--theme-primary)/0.7)]` to `text-gray-400`
3. Keep `ThemedSelectItem` classes as `text-[hsl(var(--theme-primary))]`

Updated code sections:
- Line 91: Change label color to gray
- Line 107: Change label color to gray  
- Line 108: Filter COUNTRIES to exclude `value === "US"` and `value === "PR"` (already in priority list)

