
-- Clear the rapper_images entry for Lupe Fiasco
DELETE FROM rapper_images 
WHERE rapper_id = '35d91a8a-c62f-4194-84e3-db5cdd649530';

-- Clear the legacy image_url in the rappers table
UPDATE rappers 
SET image_url = NULL 
WHERE id = '35d91a8a-c62f-4194-84e3-db5cdd649530';
