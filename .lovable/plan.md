

## User Activity Map on Platform Analytics

### Current State
- The `voter_locations` table stores country, country_code, region, and city per user (via IP geolocation on login)
- Currently only 4 records exist, all in California -- so the map will be sparse initially but will grow as more users visit
- The existing `CityMap` component uses Leaflet with react-leaflet, dark CARTO tiles, and CircleMarkers

### Approach: Country-level aggregation with US state drill-down
Given the data structure (country/region/city), a 100-mile radius clustering would require lat/lng stored per user which we don't have. Instead, we aggregate by:
- **Country** for international users (circle on country centroid)
- **US State** for domestic users (circle on state centroid)

This matches the existing geographic filter system (195 countries + 50 US states). Marker size scales by user count. The map is full-width, taller than the city map (450px), and centered on the world view (zoom 2).

### Files to Create/Edit

1. **`src/hooks/useVoterActivityMap.ts`** (new) -- Query `voter_locations`, aggregate counts by country (and by region for US), return array with label, count, and hardcoded centroid coordinates for each country/US-state.

2. **`src/components/analytics/VoterActivityMap.tsx`** (new) -- Full-width Leaflet map component similar to `CityMap` but:
   - World-centered (center [20, 0], zoom 2)
   - Taller container (h-[450px])
   - CircleMarkers sized proportionally to user count
   - Gold-gradient coloring (gold for highest, fading down)
   - Tooltips showing location name + user count
   - Country/state centroid coordinate lookup (built-in map of ~30 most common countries + 50 US states)

3. **`src/components/analytics/VoterActivityMapCard.tsx`** (new) -- Themed card wrapper with title "User Activity Map", Globe icon, and a ranked list below the map showing top 10 locations.

4. **`src/components/analytics/VotingAnalytics.tsx`** (edit) -- Add `VoterActivityMapCard` as the first card after the header, full-width.

### Technical Details
- Centroid coordinates for countries/states will be a static lookup object (~80 entries covering major countries + 50 US states)
- The hook uses a simple `supabase.from('voter_locations').select('country, country_code, region')` query, then client-side aggregation (data is small -- one row per user)
- No database migration needed; existing table and RLS policies suffice (voter_locations has public SELECT via existing policies... let me verify)

