
DROP VIEW IF EXISTS public.poll_results;

CREATE VIEW public.poll_results AS
SELECT
  po.poll_id,
  po.id AS option_id,
  COALESCE(counts.vote_count, 0) AS vote_count
FROM poll_options po
LEFT JOIN (
  SELECT poll_id, option_id, count(*) AS vote_count
  FROM poll_votes
  GROUP BY poll_id, option_id
) counts ON counts.poll_id = po.poll_id AND counts.option_id = po.id;
