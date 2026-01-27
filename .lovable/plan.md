
# Fetch Group Discographies for Solo Artists

## Problem Analysis

The partial alias matching we implemented works correctly for albums that are **already being fetched**. However, the DJ Jazzy Jeff & The Fresh Prince albums are never fetched because:

1. **Current behavior**: The Edge Function queries MusicBrainz using `artist=${musicbrainzId}` - this only returns releases directly credited to Will Smith's MusicBrainz ID (`5bae7081-64ef-4473-825a-38d310deb14c`)

2. **The duo is a separate entity**: In MusicBrainz, "DJ Jazzy Jeff & The Fresh Prince" is its own artist with ID `0d41a3cd-2e31-4e01-a200-f2fd93ceee2c` - it's not the same as Will Smith's solo ID

3. **MusicBrainz tracks memberships**: The API provides `artist-rels` (artist relationships) that show Will Smith is a member of "DJ Jazzy Jeff & The Fresh Prince"

## Solution

Enhance the Edge Function to:
1. Fetch artist relationships including `artist-rels` (group memberships)
2. Identify groups where the rapper is listed as a member
3. Fetch discographies for each related group
4. Apply the existing filtering and matching logic to include those albums

---

## Technical Implementation

### Step 1: Add artist-rels to artist lookup

**File:** `supabase/functions/fetch-rapper-discography/index.ts`

**Line ~350 - Add artist-rels to the inc parameter:**
```text
// Current:
const artistData = await mbJson<MusicBrainzArtist>(
  `https://musicbrainz.org/ws/2/artist/${musicbrainzId}?inc=aliases+label-rels+url-rels&fmt=json`
);

// Change to:
const artistData = await mbJson<MusicBrainzArtist>(
  `https://musicbrainz.org/ws/2/artist/${musicbrainzId}?inc=aliases+label-rels+url-rels+artist-rels&fmt=json`
);
```

### Step 2: Extract group memberships from relations

Add code after fetching artist data to identify groups:

```text
// Extract group memberships from artist relations
const groupMemberships: Array<{ id: string; name: string }> = [];
const artistRels = (artistData.relations || []).filter(r => r['target-type'] === 'artist');

for (const rel of artistRels) {
  // "member of band" relationship indicates group membership
  if (rel.type === 'member of band' && rel.artist?.id && rel.artist?.name) {
    console.log(`Found group membership: ${rel.artist.name} (${rel.artist.id})`);
    groupMemberships.push({ id: rel.artist.id, name: rel.artist.name });
  }
}

console.log(`Found ${groupMemberships.length} group memberships for ${rapper.name}`);
```

### Step 3: Fetch discographies for related groups

Modify the release group fetching to include groups:

```text
// Fetch releases from both the solo artist AND any groups they're a member of
const allArtistIds = [musicbrainzId, ...groupMemberships.map(g => g.id)];

let rgAlbums: any[] = [];
let rgEps: any[] = [];

for (const artistId of allArtistIds) {
  const isGroup = artistId !== musicbrainzId;
  if (isGroup) {
    console.log(`Fetching discography for group: ${groupMemberships.find(g => g.id === artistId)?.name}`);
  }
  
  const albums = await fetchAllReleaseGroups('album', artistId);
  const eps = await fetchAllReleaseGroups('ep', artistId);
  
  rgAlbums.push(...albums);
  rgEps.push(...eps);
  
  await delay(1100);
}

// Deduplicate by release group ID (in case same album appears under multiple artists)
rgAlbums = deduplicateById(rgAlbums);
rgEps = deduplicateById(rgEps);
```

### Step 4: Update fetchAllReleaseGroups to accept artist ID parameter

```text
// Current signature:
const fetchAllReleaseGroups = async (type: 'album' | 'ep') => {

// Change to:
const fetchAllReleaseGroups = async (type: 'album' | 'ep', artistId: string = musicbrainzId) => {
```

### Step 5: Add deduplication helper

```text
const deduplicateById = (items: any[]): any[] => {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};
```

---

## Expected Result for Will Smith

After deployment and refresh:

**Group memberships detected:**
- DJ Jazzy Jeff & The Fresh Prince (`0d41a3cd-2e31-4e01-a200-f2fd93ceee2c`)

**Albums now included:**
- Rock the House (1987)
- He's the DJ, I'm the Rapper (1988)
- And in This Corner... (1989)
- Homebase (1991)
- Code Red (1993)
- Plus existing solo albums (1997+)

---

## Benefits for Other Artists

This enhancement will also help:
- **Rakim** → Eric B. & Rakim albums
- **Phife Dawg** → A Tribe Called Quest albums
- **Q-Tip** → A Tribe Called Quest albums
- **Black Thought** → The Roots albums
- Any solo artist who was part of a group

---

## Safeguards

1. **Existing filters remain active**: Instrumental, bootleg, tribute album filtering still applies
2. **Credit validation still runs**: Albums must still pass the artist credit validation
3. **Deduplication**: Same album won't appear twice if credited to both solo and group
4. **Rate limiting**: Proper 1.1s delays between MusicBrainz API calls
5. **Execution time guard**: Still respects 50-second limit

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/fetch-rapper-discography/index.ts` | Add artist-rels lookup, group membership extraction, multi-artist discography fetching |

---

## Deployment Steps

1. Update the Edge Function with group membership logic
2. Deploy the updated function
3. Force refresh Will Smith's discography
4. Verify DJ Jazzy Jeff & The Fresh Prince albums appear
