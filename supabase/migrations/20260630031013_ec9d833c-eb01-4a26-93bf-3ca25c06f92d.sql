
DROP FUNCTION IF EXISTS public.get_public_member_stats(uuid[]);
CREATE OR REPLACE FUNCTION public.get_public_member_stats(_user_ids uuid[] DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  status text,
  total_upvotes integer,
  total_comments integer,
  total_votes integer,
  ranking_lists_created integer,
  consecutive_voting_days integer,
  top_five_created integer,
  rappers_voted_count integer,
  votes_with_notes_count integer,
  quiz_questions_answered integer,
  quiz_correct_answers integer,
  quiz_best_streak integer,
  badges jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, status, total_upvotes, total_comments, total_votes,
         ranking_lists_created, consecutive_voting_days, top_five_created,
         rappers_voted_count, votes_with_notes_count,
         quiz_questions_answered, quiz_correct_answers, quiz_best_streak,
         badges
  FROM public.member_stats
  WHERE _user_ids IS NULL OR id = ANY(_user_ids);
$$;
REVOKE ALL ON FUNCTION public.get_public_member_stats(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_member_stats(uuid[]) TO anon, authenticated;
