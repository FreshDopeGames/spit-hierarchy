
# Clean Up Eve's Record Label Associations

## Problem

Eve currently has record labels from the **wrong Eve** (Japanese artist) mixed with some correct ones. The database shows:

| Label | Status | Verdict |
|-------|--------|---------|
| Aftermath Entertainment (1998) | ❌ Ended 1998 | ✅ Keep - correct, but she was briefly signed |
| TOY'S FACTORY (2019-current) | ✅ Current | ❌ Remove - Japanese label |
| harapeco records | ✅ Current | ❌ Remove - Japanese label |
| factoryS | ✅ Current | ❌ Remove - Japanese label |
| Erving Wonder | ✅ Current | ❌ Remove - Japanese label |
| Interscope Records | ✅ Current | ✅ Keep - but needs proper dates |

## Eve's Actual Label History

Based on research:
- **Aftermath Entertainment** (1998) - Brief signing as "Eve of Destruction"
- **Ruff Ryders Entertainment / Interscope Records** (1999–2007) - Her main career
- **From The Rib Music** (2011–present) - Her independent label for *Lip Lock*

## Solution

### Step 1: Delete Wrong Japanese Labels

Remove the 4 incorrect label associations:
- TOY'S FACTORY
- harapeco records
- factoryS  
- Erving Wonder

### Step 2: Update Correct Label Dates

Fix the existing correct labels with proper dates:
- **Aftermath Entertainment**: 1998–1998 (brief signing)
- **Interscope Records**: 1999–2007 (main career years)

### Step 3: Create Missing Labels

Add labels that don't exist yet:
- **Ruff Ryders Entertainment** (new label record)
- **From The Rib Music** (new label record)

### Step 4: Link Missing Labels to Eve

Create rapper_labels entries:
- Ruff Ryders Entertainment (1999–2007)
- From The Rib Music (2011–present, is_current = true)

---

## SQL Migration

```sql
-- Fix Eve's record label associations
-- Remove wrong Japanese labels

DELETE FROM rapper_labels 
WHERE rapper_id = (SELECT id FROM rappers WHERE slug = 'eve')
AND label_id IN (
  SELECT id FROM record_labels 
  WHERE name IN ('TOY''S FACTORY', 'harapeco records', 'factoryS', 'Erving Wonder')
);

-- Update Aftermath Entertainment dates (1998 brief signing)
UPDATE rapper_labels
SET start_year = 1998, end_year = 1998, is_current = false
WHERE rapper_id = (SELECT id FROM rappers WHERE slug = 'eve')
AND label_id = (SELECT id FROM record_labels WHERE name = 'Aftermath Entertainment');

-- Update Interscope Records dates (1999-2007)
UPDATE rapper_labels
SET start_year = 1999, end_year = 2007, is_current = false
WHERE rapper_id = (SELECT id FROM rappers WHERE slug = 'eve')
AND label_id = (SELECT id FROM record_labels WHERE name = 'Interscope Records');

-- Create Ruff Ryders Entertainment label if it doesn't exist
INSERT INTO record_labels (name)
SELECT 'Ruff Ryders Entertainment'
WHERE NOT EXISTS (SELECT 1 FROM record_labels WHERE name = 'Ruff Ryders Entertainment');

-- Create From The Rib Music label if it doesn't exist
INSERT INTO record_labels (name)
SELECT 'From The Rib Music'
WHERE NOT EXISTS (SELECT 1 FROM record_labels WHERE name = 'From The Rib Music');

-- Link Ruff Ryders Entertainment to Eve (1999-2007)
INSERT INTO rapper_labels (rapper_id, label_id, start_year, end_year, is_current)
SELECT 
  (SELECT id FROM rappers WHERE slug = 'eve'),
  (SELECT id FROM record_labels WHERE name = 'Ruff Ryders Entertainment'),
  1999,
  2007,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM rapper_labels 
  WHERE rapper_id = (SELECT id FROM rappers WHERE slug = 'eve')
  AND label_id = (SELECT id FROM record_labels WHERE name = 'Ruff Ryders Entertainment')
);

-- Link From The Rib Music to Eve (2011-present)
INSERT INTO rapper_labels (rapper_id, label_id, start_year, end_year, is_current)
SELECT 
  (SELECT id FROM rappers WHERE slug = 'eve'),
  (SELECT id FROM record_labels WHERE name = 'From The Rib Music'),
  2011,
  NULL,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM rapper_labels 
  WHERE rapper_id = (SELECT id FROM rappers WHERE slug = 'eve')
  AND label_id = (SELECT id FROM record_labels WHERE name = 'From The Rib Music')
);
```

---

## Expected Result

After implementation, Eve's Career Overview card will show:

| Label | Years |
|-------|-------|
| Aftermath Entertainment | 1998 |
| Ruff Ryders Entertainment | 1999–2007 |
| Interscope Records | 1999–2007 |
| From The Rib Music | 2011–present |
