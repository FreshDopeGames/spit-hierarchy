-- Re-link missing Lupe Fiasco mixtapes
-- Lupe Fiasco rapper_id: 35d91a8a-c62f-4194-84e3-db5cdd649530

-- Fahrenheit 1/15, Part 1: The Truth Is Among Us
INSERT INTO rapper_albums (rapper_id, album_id, role)
VALUES ('35d91a8a-c62f-4194-84e3-db5cdd649530', '9eff036a-6522-49d9-9235-a4c1e7e4ce7a', 'primary')
ON CONFLICT (rapper_id, album_id) DO NOTHING;

-- Fahrenheit 1/15, Part 3: A Rhyming Ape
INSERT INTO rapper_albums (rapper_id, album_id, role)
VALUES ('35d91a8a-c62f-4194-84e3-db5cdd649530', '7ddffab9-8823-4816-a73a-5c8641c16d74', 'primary')
ON CONFLICT (rapper_id, album_id) DO NOTHING;

-- Friend of the People: I Fight Evil
INSERT INTO rapper_albums (rapper_id, album_id, role)
VALUES ('35d91a8a-c62f-4194-84e3-db5cdd649530', '2a8171b9-e012-4651-9bba-129766bca326', 'primary')
ON CONFLICT (rapper_id, album_id) DO NOTHING;