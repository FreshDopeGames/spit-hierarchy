-- Remove incorrect "Blackstar" (Instrumental) album link from Lupe Fiasco
DELETE FROM rapper_albums 
WHERE album_id = '0015ecb4-cad6-4b2f-97b3-9a738055ca27' 
AND rapper_id = '35d91a8a-c62f-4194-84e3-db5cdd649530';