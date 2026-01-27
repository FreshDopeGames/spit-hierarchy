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