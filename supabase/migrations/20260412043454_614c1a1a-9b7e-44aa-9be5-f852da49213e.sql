
-- Restore 3 lost votes (vote_weight=3 each, gold status) for Twista and Joyner Lucas
-- in the Best Speed Rappers ranking for user 6f9dbd2b-246e-43f1-9502-3fccc1699c06
INSERT INTO ranking_votes (ranking_id, rapper_id, user_id, vote_weight, member_status, vote_date)
VALUES 
  ('94f0438f-1c66-416c-bb61-11b38d99da13', 'cf688bc8-0f87-4aef-a956-eba0f93b7abf', '6f9dbd2b-246e-43f1-9502-3fccc1699c06', 3, 'gold', '2026-04-11'),
  ('94f0438f-1c66-416c-bb61-11b38d99da13', '659ba4a9-5eaf-48ad-a965-edbbaf1663e3', '6f9dbd2b-246e-43f1-9502-3fccc1699c06', 3, 'gold', '2026-04-11');
