-- Remove 'BIG' from The Notorious B.I.G.'s aliases to prevent false positives
UPDATE rappers 
SET aliases = array_remove(aliases, 'BIG')
WHERE slug = 'the-notorious-big';