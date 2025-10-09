-- Create trigger to update rapper activity score when page views are recorded
CREATE TRIGGER update_activity_score_on_view
  AFTER INSERT ON public.rapper_page_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rapper_activity_on_view();

-- Backfill all activity scores based on existing page views
SELECT public.update_all_rapper_activity_scores();