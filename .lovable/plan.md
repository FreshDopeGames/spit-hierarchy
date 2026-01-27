

# Add Spotify & Apple Music Links to Album Detail Page

## Overview

This plan adds Spotify and Apple Music buttons to the Album Detail page with a redesigned layout:
- Smaller rapper avatar, left-aligned under the album title
- Streaming service buttons aligned to the right of the avatar
- Uses the same "gold fill" button styling as the Rapper Header social buttons

---

## Current Layout

```text
┌─────────────────────────────────────┐
│         [Album Cover 384px]         │
│                                     │
│           Album Title               │
│                                     │
│      [Rapper Avatar 192px]          │ ← Centered, large
│                                     │
│          Rapper Name                │
│                                     │
│    [Badge] [Year] [Track Count]     │
└─────────────────────────────────────┘
```

---

## New Layout

```text
┌─────────────────────────────────────┐
│         [Album Cover 384px]         │
│                                     │
│           Album Title               │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [Avatar]  Rapper Name       │ [Spotify] [Apple Music]
│  │  96px     (link)            │    │
│  └─────────────────────────────┘    │
│                                     │
│    [Badge] [Year] [Track Count]     │
└─────────────────────────────────────┘
```

The avatar row becomes a horizontal flex layout with:
- Left side: Small avatar (sm size, ~96px) + rapper name link
- Right side: Spotify and Apple Music buttons

---

## Implementation Steps

### Step 1: Update Database Function to Return Streaming Links

**File:** New SQL migration

Add `external_cover_links` to the `get_album_with_tracks` function:

```sql
CREATE OR REPLACE FUNCTION get_album_with_tracks(album_uuid UUID)
RETURNS TABLE (...existing fields..., external_cover_links JSONB)
AS $$
  SELECT
    a.id as album_id,
    -- ...existing fields...
    a.external_cover_links,  -- ADD THIS
    COALESCE(...tracks...) as tracks
  FROM public.albums a
  ...
$$
```

### Step 2: Update useAlbumDetail Hook

**File:** `src/hooks/useAlbumDetail.tsx`

Add `external_cover_links` to the `AlbumDetail` interface and query return:

```typescript
interface AlbumDetail {
  // ...existing fields...
  external_cover_links?: {
    spotify?: string;
    apple_music?: string;
    deezer?: string;
    youtube_music?: string;
  };
}

// In the queryFn return:
return {
  // ...existing fields...
  external_cover_links: album.external_cover_links || null,
};
```

### Step 3: Update AlbumHeader Component

**File:** `src/components/album/AlbumHeader.tsx`

#### 3a. Update interface to accept streaming links

```typescript
interface AlbumHeaderProps {
  // ...existing props...
  externalLinks?: {
    spotify?: string;
    appleMusic?: string;
  };
}
```

#### 3b. Import necessary components

```typescript
import { ThemedButton } from "@/components/ui/themed-button";
import { Music } from "lucide-react"; // For Spotify icon
```

#### 3c. Redesign the avatar/name section

Replace the current centered avatar + name section with a horizontal layout:

```tsx
{/* Artist + Streaming Links Row */}
<div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-4 w-full max-w-lg mx-auto">
  {/* Left: Avatar + Name */}
  <div className="flex items-center gap-3">
    <RapperAvatar
      rapper={{
        id: rapperId,
        name: rapperName,
        slug: rapperSlug
      }}
      size="sm"  // Smaller size (96px instead of 192px)
      variant="square"
    />
    <Link
      to={`/rapper/${rapperSlug}`}
      className="text-lg md:text-xl text-muted-foreground hover:text-[hsl(var(--theme-primary))] transition-colors font-semibold"
    >
      {rapperName}
    </Link>
  </div>
  
  {/* Right: Streaming Buttons */}
  <div className="flex items-center gap-2">
    {externalLinks?.spotify && (
      <ThemedButton
        variant="default"
        size="sm"
        className="bg-[hsl(var(--theme-primary))] text-black hover:bg-[hsl(var(--theme-primaryLight))] border-0"
        asChild
      >
        <a href={externalLinks.spotify} target="_blank" rel="noopener noreferrer">
          <Music className="w-4 h-4 mr-2" />
          Spotify
        </a>
      </ThemedButton>
    )}
    {externalLinks?.appleMusic && (
      <ThemedButton
        variant="default"
        size="sm"
        className="bg-[hsl(var(--theme-primary))] text-black hover:bg-[hsl(var(--theme-primaryLight))] border-0"
        asChild
      >
        <a href={externalLinks.appleMusic} target="_blank" rel="noopener noreferrer">
          <Music className="w-4 h-4 mr-2" />
          Apple Music
        </a>
      </ThemedButton>
    )}
  </div>
</div>
```

### Step 4: Update AlbumDetail Page to Pass Streaming Links

**File:** `src/pages/AlbumDetail.tsx`

Generate links using both direct DB links and fallback search links:

```typescript
import { generateExternalAlbumLinks } from "@/utils/albumPlaceholderUtils";

// Before rendering AlbumHeader:
const searchLinks = generateExternalAlbumLinks(
  album.album_title,
  album.rapper_name,
  album.release_type as 'album' | 'mixtape' | 'ep' | 'single'
);
const directLinks = album.external_cover_links || {};
const externalLinks = {
  spotify: directLinks.spotify || searchLinks.spotify,
  appleMusic: directLinks.apple_music || searchLinks.appleMusic,
};

// Pass to AlbumHeader:
<AlbumHeader
  // ...existing props...
  externalLinks={externalLinks}
/>
```

### Step 5: Update Loading Skeleton

**File:** `src/pages/AlbumDetail.tsx`

Update the skeleton to match the new layout (smaller avatar, horizontal arrangement):

```tsx
{/* Artist Row Skeleton */}
<div className="flex items-center justify-center gap-4 w-full max-w-lg mx-auto">
  <div className="flex items-center gap-3">
    <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg" /> {/* sm avatar */}
    <Skeleton className="h-6 w-32" /> {/* rapper name */}
  </div>
  <div className="flex items-center gap-2">
    <Skeleton className="h-9 w-24 rounded-md" /> {/* Spotify button */}
    <Skeleton className="h-9 w-32 rounded-md" /> {/* Apple Music button */}
  </div>
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| New SQL migration | Add `external_cover_links` to `get_album_with_tracks` function |
| `src/hooks/useAlbumDetail.tsx` | Add `external_cover_links` to interface and return |
| `src/components/album/AlbumHeader.tsx` | Resize avatar to "sm", add horizontal layout, add streaming buttons |
| `src/pages/AlbumDetail.tsx` | Generate external links and pass to AlbumHeader, update skeleton |

---

## Visual Result

- **Avatar**: Reduced from 192px (lg) to 96px (sm) for better proportion
- **Layout**: Rapper avatar and name left-aligned, streaming buttons right-aligned
- **Buttons**: Gold-filled Spotify and Apple Music buttons matching the Rapper Header style
- **Fallback**: If direct links aren't in the database, search-based links are generated

---

## Mobile Behavior

On mobile (< sm breakpoint), the layout stacks vertically:
- Avatar + Name centered
- Streaming buttons centered below

