
# Make Rapper Tags Clickable on Detail Page

## Overview

This feature adds clickable functionality to the style/genre tags shown on rapper detail pages. Clicking a tag will navigate to the All Rappers page filtered to show only rappers with that tag.

---

## Current State

- Tags display on rapper detail page in `RapperHeader.tsx` as static badges
- Tags have `name`, `slug`, and `color` properties
- All Rappers page has filters for search, location, zodiac, sort, and order
- No tag filter currently exists on the All Rappers page

---

## Implementation Steps

### 1. Update Navigation State to Support Tag Filter

**File:** `src/hooks/useNavigationState.ts`

Add `tag` to the `AllFilters` interface and handle it in URL parameter management:

```typescript
export interface AllFilters {
  // ...existing fields
  tag?: string;  // Tag slug for filtering
}
```

Update `getAllFilters()` and `setAllFilters()` to read/write the `tag` param.

---

### 2. Add Tag Filter to useAllRappers Hook

**File:** `src/hooks/useAllRappers.ts`

- Add state for `tagFilter` initialized from URL params
- Add handler `handleTagFilterChange`
- Modify the query to filter rappers by tag assignment

The query will join with `rapper_tag_assignments` and `rapper_tags` to filter:

```typescript
// When tagFilter is set, get rapper IDs with that tag first
if (tagFilter && tagFilter !== "all") {
  // Get rapper IDs that have this tag
  const { data: taggedRapperIds } = await supabase
    .from("rapper_tag_assignments")
    .select("rapper_id, rapper_tags!inner(slug)")
    .eq("rapper_tags.slug", tagFilter);
  
  // Filter main query by these IDs
  query = query.in("id", taggedRapperIds.map(r => r.rapper_id));
}
```

---

### 3. Update AllRappersFilters Component

**File:** `src/components/AllRappersFilters.tsx`

Add an active tag badge that shows when filtering by tag, with an "X" to clear:

```tsx
interface AllRappersFiltersProps {
  // ...existing props
  tagFilter: string;
  onTagFilterChange: (value: string) => void;
}

// Show active tag badge when filtering
{tagFilter && tagFilter !== "all" && (
  <Badge 
    className="cursor-pointer"
    onClick={() => onTagFilterChange("all")}
  >
    {tagFilter} ✕
  </Badge>
)}
```

---

### 4. Update AllRappersPage

**File:** `src/pages/AllRappersPage.tsx`

Pass the new tag filter props to the filters component.

---

### 5. Make Tags Clickable on Rapper Detail

**File:** `src/components/rapper/RapperHeader.tsx`

Wrap each tag badge in a `Link` component:

```tsx
{tags.map((tag) => (
  <Link key={tag.id} to={`/all-rappers?tag=${tag.slug}`}>
    <Badge
      variant="secondary"
      className="font-[var(--theme-font-body)] cursor-pointer hover:opacity-80 transition-opacity"
      style={{ backgroundColor: tag.color, color: getContrastTextColor(tag.color) }}
    >
      {tag.name}
    </Badge>
  </Link>
))}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useNavigationState.ts` | Add `tag` to AllFilters interface and URL handling |
| `src/hooks/useAllRappers.ts` | Add tagFilter state, handler, and query filter logic |
| `src/components/AllRappersFilters.tsx` | Add active tag display with clear button |
| `src/pages/AllRappersPage.tsx` | Pass tag filter props |
| `src/components/rapper/RapperHeader.tsx` | Wrap tags in Link components |

---

## User Experience

1. User visits a rapper's profile (e.g., Kendrick Lamar)
2. User sees tags like "Lyricist", "Conscious", "Introspective"
3. User clicks "Lyricist" tag
4. User is navigated to `/all-rappers?tag=lyricist`
5. All Rappers page shows only rappers tagged as "Lyricist" (154 rappers)
6. An active filter badge shows "Lyricist ✕" - clicking clears the filter

---

## URL Examples

- `/all-rappers?tag=lyricist` - Filter by Lyricist tag
- `/all-rappers?tag=conscious&sort=rating` - Conscious rappers sorted by rating
- `/all-rappers?tag=gangsta&location=Compton` - Gangsta rappers from Compton
