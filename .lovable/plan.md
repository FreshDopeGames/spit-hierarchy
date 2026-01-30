
# Add Rap Style Tag Dropdown Filter to All Rappers Page

## Overview

Add a dropdown filter for rap style tags on the All Rappers page, allowing users to browse rappers by style directly without needing to click through from a rapper's profile.

---

## Current State

- The page already has `tagFilter` state and `onTagFilterChange` handler connected
- A tag badge with "X" button shows when filtering by tag (from URL deep-link)
- There are 26 rap style tags in the database
- The Zodiac dropdown provides a pattern to follow

---

## Implementation

### Create Hook to Fetch All Tags

**New File:** `src/hooks/useAllRapperTags.ts`

```typescript
// Fetch all rapper_tags for the dropdown
const { data, error } = await supabase
  .from("rapper_tags")
  .select("id, name, slug, color")
  .order("name");
```

---

### Update AllRappersFilters Component

**File:** `src/components/AllRappersFilters.tsx`

Add a new Style/Tag dropdown between Zodiac and Sort By:

```tsx
{/* Rap Style Filter */}
<div className="min-w-0 max-w-full">
  <Select value={tagFilter} onValueChange={onTagFilterChange}>
    <SelectTrigger className="bg-black/95 border-[hsl(var(--theme-border))] ...">
      <SelectValue placeholder="Style" />
    </SelectTrigger>
    <SelectContent className="bg-black border-2 border-[hsl(var(--theme-primary))] ... max-h-60">
      <SelectItem value="all">All Styles</SelectItem>
      {allTags.map((tag) => (
        <SelectItem key={tag.id} value={tag.slug}>
          {tag.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

---

### Grid Layout Update

Expand from 5 columns to 6 columns on large screens to accommodate the new dropdown:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
```

---

### Remove Duplicate Active Tag Badge

Since there's now a dropdown for tag selection, the separate active tag badge shown above the filters becomes redundant. Remove it to keep the UI clean - the dropdown itself will show the selected value.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useAllRapperTags.ts` | Fetch all rapper tags for dropdown |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/AllRappersFilters.tsx` | Add Style dropdown, update grid to 6 columns, remove duplicate badge |

---

## User Experience

1. User visits `/all-rappers`
2. User sees "Style" dropdown alongside Zodiac, Sort By, etc.
3. User clicks Style dropdown and sees all 26 rap styles (Battle Rapper, Conscious, Gangsta, Lyricist, etc.)
4. User selects "Party Vibes"
5. URL updates to `/all-rappers?tag=party-vibes`
6. Grid filters to show only rappers with the Party Vibes tag
7. Dropdown shows "Party Vibes" as selected value
8. User can select "All Styles" to clear the filter
