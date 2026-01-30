

# Enhanced Track Fetching with MusicBrainz Artist Credits & Collaboration Network

## Overview

This plan enhances the track fetching system to capture featured artist credits from MusicBrainz and builds a rapper collaboration network. Importantly, **only artists that exist in our database will be hyperlinked** - all other artists will display as plain text.

---

## Phase 1: Database Schema

### New Tables

**1. `track_artists`** - Store all artist credits for each track

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `track_id` | uuid | Foreign key to `album_tracks` |
| `artist_name` | text | Artist name as credited on MusicBrainz |
| `musicbrainz_artist_id` | text | MusicBrainz artist ID |
| `join_phrase` | text | Credit separator: " feat. ", " & ", etc. |
| `is_primary` | boolean | True for main artist, false for features |
| `position` | integer | Order in artist credit (1 = first) |
| `rapper_id` | uuid (nullable) | Link to `rappers` table **if matched** |

**2. `rapper_collaborations`** - Aggregated collaboration pairs

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `rapper_id` | uuid | First rapper |
| `collaborator_id` | uuid | Second rapper |
| `collaboration_count` | integer | Number of tracks together |
| `source` | text | 'track_credit', 'shared_album', 'manual' |
| `track_ids` | uuid[] | Tracks they collaborated on |
| `album_ids` | uuid[] | Unique albums |

---

## Phase 2: Enhanced Track Fetching

### MusicBrainz API Change

Update `fetch-album-tracks/index.ts` to request artist credits:

```text
Current:  inc=recordings
Enhanced: inc=recordings+artist-credits
```

This returns data like:

```json
{
  "recording": {
    "title": "Renegade",
    "artist-credit": [
      { "artist": { "id": "abc", "name": "Jay-Z" }, "joinphrase": " feat. " },
      { "artist": { "id": "xyz", "name": "Eminem" }, "joinphrase": "" }
    ]
  }
}
```

### Processing Logic

For each track:
1. Parse the `artist-credit` array
2. Insert each artist into `track_artists` with position and join phrase
3. Mark the first artist as `is_primary = true`
4. Attempt to match to our `rappers` table (see Phase 3)

---

## Phase 3: Rapper Matching Logic

After capturing artist credits, link them to our database when possible:

### Matching Strategy (in priority order)

1. **MusicBrainz ID match** - `musicbrainz_artist_id` matches `rappers.musicbrainz_id`
2. **Exact name match** - Case-insensitive `artist_name` matches `rappers.name`
3. **Alias match** - `artist_name` matches any entry in `rappers.aliases`

### Batch Matching Function

```sql
CREATE OR REPLACE FUNCTION match_track_artists_to_rappers()
RETURNS INTEGER AS $$
-- Matches unlinked track_artists records to rappers
-- Sets rapper_id when a match is found
-- Returns count of newly matched records
$$
```

**Important**: Artists that don't match remain with `rapper_id = NULL` - they'll still display but won't be linked.

---

## Phase 4: Conditional Display in Track List

### Updated `AlbumTrackList.tsx` Component

The track list will show featured artists with conditional linking:

```tsx
// Example: Rendering artist credits
{track.artists?.map((artist, i) => (
  <span key={artist.id}>
    {i > 0 && <span className="text-muted-foreground">{artist.join_phrase || ", "}</span>}
    {artist.rapper_id ? (
      // Linked - rapper exists in our database
      <Link 
        to={`/rapper/${artist.rapper_slug}`}
        className="hover:text-[var(--theme-primary)] hover:underline"
      >
        {artist.artist_name}
      </Link>
    ) : (
      // Plain text - artist not in our database
      <span className="text-muted-foreground">{artist.artist_name}</span>
    )}
  </span>
))}
```

### Visual Example

For a track "Renegade" by Jay-Z feat. Eminem:
- If both Jay-Z and Eminem are in our database: **Jay-Z** feat. **Eminem** (both linked)
- If only Jay-Z is in our database: **Jay-Z** feat. Eminem (only Jay-Z linked)
- If neither is matched: Jay-Z feat. Eminem (plain text)

---

## Phase 5: Collaboration Aggregation

### Database Function: `refresh_rapper_collaborations()`

Builds the network from matched artists only:

```sql
-- Find tracks where 2+ artists have rapper_id set
-- Group by pairs and count collaborations
INSERT INTO rapper_collaborations (...)
SELECT 
  LEAST(ta1.rapper_id, ta2.rapper_id),
  GREATEST(ta1.rapper_id, ta2.rapper_id),
  COUNT(DISTINCT ta1.track_id),
  'track_credit',
  ARRAY_AGG(DISTINCT ta1.track_id),
  ARRAY_AGG(DISTINCT at.album_id)
FROM track_artists ta1
JOIN track_artists ta2 ON ta1.track_id = ta2.track_id 
  AND ta1.rapper_id < ta2.rapper_id
JOIN album_tracks at ON ta1.track_id = at.id
WHERE ta1.rapper_id IS NOT NULL 
  AND ta2.rapper_id IS NOT NULL  -- Only matched rappers
GROUP BY ...
```

---

## Phase 6: Network Visualization

### Collaborator Network Graph (`CollaboratorNetworkGraph.tsx`)

Force-directed canvas visualization for the Analytics page:
- **Nodes**: Rappers sized by total collaborations
- **Edges**: Connections weighted by collaboration count
- **Interaction**: Click to view details, filter by min collaborations

### Collaborators Card (`CollaboratorsCard.tsx`)

For individual rapper profiles:
- Shows top 5-10 collaborators with counts
- Lists sample track titles
- Links to collaborator profiles

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/xxx_create_track_artists.sql` | New table with RLS |
| `supabase/migrations/xxx_create_rapper_collaborations.sql` | Aggregation table + functions |
| `src/hooks/useRapperCollaborations.ts` | Fetch full network data |
| `src/hooks/useRapperCollaborators.ts` | Fetch single rapper's collaborators |
| `src/hooks/useTrackArtists.ts` | Fetch track artist credits |
| `src/components/analytics/CollaboratorNetworkGraph.tsx` | Network visualization |
| `src/components/rapper/CollaboratorsCard.tsx` | Profile collaborators card |
| `src/components/album/TrackArtistCredits.tsx` | Conditional artist display |

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/fetch-album-tracks/index.ts` | Add `+artist-credits` to API call, parse and store credits |
| `supabase/functions/bulk-fetch-album-tracks/index.ts` | Add re-fetch mode for existing tracks |
| `src/components/album/AlbumTrackList.tsx` | Display featured artists with conditional links |
| `src/hooks/useAlbumDetail.tsx` | Include track artist credits in query |
| `src/components/analytics/RapperStatsAnalytics.tsx` | Add CollaboratorNetworkGraph |
| `src/pages/RapperDetail.tsx` | Add CollaboratorsCard |
| `src/components/admin/AdminDataManagement.tsx` | Add collaboration refresh button |

---

## Data Flow

```text
MusicBrainz API (artist-credits)
        |
        v
fetch-album-tracks (parse credits)
        |
        v
track_artists table (ALL artists stored)
        |
        v
match_track_artists_to_rappers() 
        |
   +----+----+
   |         |
   v         v
rapper_id   NULL
 (linked)  (plain text display)
   |
   v
refresh_rapper_collaborations()
   |
   v
rapper_collaborations table
   |
   v
Network Visualization
```

---

## Key Behavior Summary

| Artist Status | Track Display | Network Graph |
|--------------|---------------|---------------|
| In our database (matched) | Hyperlinked to profile | Included in network |
| Not in database | Plain text (no link) | Not included |

This ensures users only see clickable links for rappers we actually have pages for, while still capturing the full collaboration data from MusicBrainz.

---

## Implementation Order

1. Create `track_artists` table and RLS
2. Create `rapper_collaborations` table and aggregation function
3. Update `fetch-album-tracks` to capture artist credits
4. Create rapper matching function
5. Build `TrackArtistCredits` component with conditional linking
6. Update `AlbumTrackList` to display credits
7. Run bulk re-fetch on albums with MusicBrainz IDs
8. Build network visualization components
9. Add to Analytics page and rapper profiles

