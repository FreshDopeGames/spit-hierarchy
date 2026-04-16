

# Populate Missing Career Start Years via Discography Fetches

## Steps

### 1. Fix Slick Rick's career_start_year
Update from 1965 (birth year) to 1985 using the Supabase insert tool.

### 2. Fetch discographies in 4 batches of 5
Use the `fetch-rapper-discography` edge function for each rapper individually, with delays between calls to respect MusicBrainz rate limits. Batches:

- **Batch 1**: GZA, Slim Thug, Slum Village, Soulja Boy, Souls of Mischief
- **Batch 2**: Styles P, Three 6 Mafia, Tierra Whack, UGK, Vic Mensa
- **Batch 3**: Webbie, Westside Boogie, Xzibit, Young M.A, Samara Cyn (re-fetch, has 0 albums)
- **Batch 4**: Slick Rick, Dizaster, Murda Mook

### 3. Derive career_start_year from earliest release
After discographies are fetched, query the earliest `release_date` from each rapper's albums and update `career_start_year` accordingly.

### 4. Handle battle rappers
For Dizaster and Murda Mook — if MusicBrainz returns no albums, I will research their battle league debut years and set career_start_year manually:
- **Dizaster**: debuted in Grind Time ~2008, then KOTD/URL
- **Murda Mook**: debuted in Smack DVD era ~2003

### Technical detail
- Each `fetch-rapper-discography` call will be invoked via `supabase--curl_edge_functions`
- ~1.5s spacing between calls (handled by the edge function's internal rate limiting)
- Career start year updates via `supabase insert tool` with UPDATE statements

