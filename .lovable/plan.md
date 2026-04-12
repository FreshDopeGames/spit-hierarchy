

## Plan: Geographic Voter Segmentation for Analytics

### Overview
Build the full geographic infrastructure (database table, edge function for IP geolocation, client hook) and add geographic filter dropdowns across all relevant analytics cards on the Platform, Rapper Stats, and Members tabs.

### Part 1: Database Infrastructure

**A. Create `voter_locations` table** (migration)
- Columns: `id` (uuid PK), `user_id` (uuid, unique, references auth.users), `country` (text), `country_code` (text), `region` (text — US state or province), `city` (text), `created_at`, `updated_at`
- RLS: authenticated users can SELECT all rows (needed for aggregation joins), users can INSERT/UPDATE their own row only

**B. Create/update server-side RPC functions** (migration)
- `get_global_voting_stats(p_country_code text DEFAULT NULL, p_region text DEFAULT NULL)` — replaces current broken client-side aggregation in GlobalStatsCards; returns total_votes, active_voters, rated_rappers, avg_rating filtered by optional geo params
- `get_most_rated_rappers(p_country_code text DEFAULT NULL, p_region text DEFAULT NULL)` — replaces client-side aggregation in MostRatedRappersCard
- Update `get_category_voting_analytics` to accept optional `p_country_code`/`p_region` params
- Update `get_public_rapper_voting_stats` to accept optional `p_country_code`/`p_region` params
- All functions join `votes.user_id` to `voter_locations.user_id` when filters are provided

### Part 2: Edge Function for IP Geolocation

**C. Create `geolocate-voter` edge function**
- Called once per user (when no `voter_locations` record exists)
- Uses free `ip-api.com` JSON endpoint (no key needed) to detect country, region, city from the request IP
- Upserts into `voter_locations` using the service role key
- Returns the detected location to the client

### Part 3: Client-Side Hook

**D. Create `src/hooks/useVoterGeolocation.ts`**
- On mount (for authenticated users), checks if user has a `voter_locations` record
- If not, calls the `geolocate-voter` edge function
- Caches result so it runs once per session
- Silent — no UI indication to the user

### Part 4: Geographic Filter Component + Data

**E. Create `src/utils/geographicData.ts`**
- Export `US_STATES` array (50 states + DC with name/code)
- Export `COUNTRIES` array (~195 countries with name/country_code)
- Both sorted alphabetically

**F. Create `src/components/analytics/GeographicFilter.tsx`**
- Reusable dropdown component using ThemedSelect
- Two modes: Country selector and Region selector (shown only when US is selected)
- Options: "All Locations" (default), "United States", then all countries alphabetically; when US selected, a second dropdown shows 50 states + DC
- Emits `{ countryCode: string | null, region: string | null }`

### Part 5: Integrate Filters into Analytics Tabs

**G. Platform tab (`VotingAnalytics.tsx`)**
- Add GeographicFilter at the top
- Pass `countryCode`/`region` state down to GlobalStatsCards, CategoryPerformanceCard, TopVotedRappersCard, MostRatedRappersCard
- Each card passes the filter params to its RPC call and includes them in the query key

**H. Rapper Stats tab (`RapperStatsAnalytics.tsx`)**
- Add GeographicFilter at the top
- Pass filters to TopRappersByCategoryCard (updates the votes query per category)

**I. Members tab (`MemberAnalytics.tsx`)**
- Add GeographicFilter alongside existing time range buttons
- Pass filters to TopMembersCards

### Part 6: Fix Existing Bugs (from earlier assessment)

**J. Fix TopRappersByCategoryCard**
- Extract `RapperAvatarItem` out of the `.map()` render loop to file scope to prevent hook remounts

**K. Fix GlobalStatsCards**
- Replace 3 separate client-side fetches with the new `get_global_voting_stats` RPC

**L. Fix MostRatedRappersCard**
- Replace client-side vote aggregation with the new `get_most_rated_rappers` RPC

### Files to create/modify

| File | Action |
|------|--------|
| Migration: `voter_locations` table + RLS | Create |
| Migration: new/updated RPC functions | Create |
| `supabase/functions/geolocate-voter/index.ts` | Create |
| `src/hooks/useVoterGeolocation.ts` | Create |
| `src/utils/geographicData.ts` | Create |
| `src/components/analytics/GeographicFilter.tsx` | Create |
| `src/components/analytics/VotingAnalytics.tsx` | Modify — add geo filter, pass to children |
| `src/components/analytics/GlobalStatsCards.tsx` | Modify — use RPC with geo params |
| `src/components/analytics/CategoryPerformanceCard.tsx` | Modify — accept geo params |
| `src/components/analytics/TopVotedRappersCard.tsx` | Modify — accept geo params |
| `src/components/analytics/MostRatedRappersCard.tsx` | Modify — use RPC with geo params |
| `src/components/analytics/RapperStatsAnalytics.tsx` | Modify — add geo filter |
| `src/components/analytics/TopRappersByCategoryCard.tsx` | Modify — extract component, accept geo params |
| `src/components/analytics/MemberAnalytics.tsx` | Modify — add geo filter |
| `src/components/analytics/TopMembersCards.tsx` | Modify — accept geo params |
| `src/App.tsx` or layout component | Modify — integrate `useVoterGeolocation` hook |

### Technical notes
- Geographic data is stored per-user (not per-vote) to keep the table small; joins happen via `user_id`
- The edge function runs server-side so raw IPs are never exposed to the client
- ip-api.com has a 45 req/min rate limit on the free tier — fine since we only call once per new user
- All existing votes automatically gain geographic context once the voter's location is recorded
- Filter defaults to "All Locations" so no change in default behavior

