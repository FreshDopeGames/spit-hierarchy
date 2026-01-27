

# Fix Eve's Discography - Wrong Artist Linked

## Problem

Eve's profile is linked to the **wrong MusicBrainz artist**. The current data shows a Japanese singer/producer named Eve (career start 2014), not **Eve Jihan Cooper**, the American hip-hop artist from Ruff Ryders who debuted in 1999.

### Current State (Wrong)

| Album | Year |
|-------|------|
| Wonder Word | 2014 |
| Round Robin | 2015 |
| 文化 (Bunka) | 2017 |
| 蒼 (Ao) | 2018 |
| おとぎ (Otogi) | 2019 |

### Expected Discography (Eve the Rapper)

| Album | Year |
|-------|------|
| Let There Be Eve...Ruff Ryders' First Lady | 1999 |
| Scorpion | 2001 |
| Eve-Olution | 2002 |
| Lip Lock | 2013 |

---

## Solution

Update Eve's MusicBrainz ID in the database and refresh her discography.

### Step 1: Database Migration

Create a migration to:
1. Update Eve's `musicbrainz_id` to the correct value
2. Remove the incorrectly linked albums
3. Update `career_start_year` to reflect her actual debut

```sql
-- Fix Eve rapper record - wrong MusicBrainz artist linked
-- Current: 66bdd1c9-d1c5-40b7-a487-5061fffbd87d (Japanese Eve)
-- Correct: 1ac10f5e-2079-4435-b78f-dda6ecdeba15 (Eve Jihan Cooper, Ruff Ryders)

-- Update the MusicBrainz ID and career start year
UPDATE rappers
SET 
  musicbrainz_id = '1ac10f5e-2079-4435-b78f-dda6ecdeba15',
  career_start_year = 1999,
  discography_last_updated = NULL  -- Force re-fetch
WHERE slug = 'eve';

-- Remove incorrectly linked albums (Japanese Eve's discography)
DELETE FROM rapper_albums 
WHERE rapper_id = (SELECT id FROM rappers WHERE slug = 'eve');
```

### Step 2: Refresh Discography

After the migration runs, clicking "Refresh" on Eve's discography page will fetch her correct albums from MusicBrainz:
- Let There Be Eve...Ruff Ryders' First Lady (1999)
- Scorpion (2001)
- Eve-Olution (2002)
- Lip Lock (2013)

---

## Files to Modify

| File | Changes |
|------|---------|
| New SQL migration | Update MusicBrainz ID, clear wrong albums |

---

## Expected Result

After implementation:
- Eve's profile shows career start: **1999**
- Discography shows her Ruff Ryders albums
- She correctly appears in **Best 90s Rappers** rankings (debut 1999)

