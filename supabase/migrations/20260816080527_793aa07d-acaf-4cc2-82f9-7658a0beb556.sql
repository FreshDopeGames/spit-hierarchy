CREATE TABLE public.album_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  overall_score NUMERIC(2,1) NOT NULL,
  verdict TEXT,
  reviewer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT album_reviews_blog_post_unique UNIQUE (blog_post_id),
  CONSTRAINT album_reviews_album_unique UNIQUE (album_id),
  CONSTRAINT album_reviews_score_range CHECK (overall_score >= 0.5 AND overall_score <= 5.0 AND (overall_score * 2) = floor(overall_score * 2))
);

GRANT SELECT ON public.album_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_reviews TO authenticated;
GRANT ALL ON public.album_reviews TO service_role;

ALTER TABLE public.album_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews on published posts"
ON public.album_reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blog_posts bp
    WHERE bp.id = album_reviews.blog_post_id
      AND bp.status = 'published'
      AND (bp.published_at IS NULL OR bp.published_at <= now())
  )
  OR public.can_manage_blog(auth.uid())
);

CREATE POLICY "Blog managers can insert reviews"
ON public.album_reviews FOR INSERT TO authenticated
WITH CHECK (public.can_manage_blog(auth.uid()));

CREATE POLICY "Blog managers can update reviews"
ON public.album_reviews FOR UPDATE TO authenticated
USING (public.can_manage_blog(auth.uid()))
WITH CHECK (public.can_manage_blog(auth.uid()));

CREATE POLICY "Blog managers can delete reviews"
ON public.album_reviews FOR DELETE TO authenticated
USING (public.can_manage_blog(auth.uid()));

CREATE TRIGGER update_album_reviews_updated_at
BEFORE UPDATE ON public.album_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.album_review_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.album_reviews(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.album_voting_categories(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT album_review_scores_unique UNIQUE (review_id, category_id)
);

GRANT SELECT ON public.album_review_scores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_review_scores TO authenticated;
GRANT ALL ON public.album_review_scores TO service_role;

ALTER TABLE public.album_review_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scores of visible reviews"
ON public.album_review_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.album_reviews ar
    JOIN public.blog_posts bp ON bp.id = ar.blog_post_id
    WHERE ar.id = album_review_scores.review_id
      AND bp.status = 'published'
      AND (bp.published_at IS NULL OR bp.published_at <= now())
  )
  OR public.can_manage_blog(auth.uid())
);

CREATE POLICY "Blog managers can insert review scores"
ON public.album_review_scores FOR INSERT TO authenticated
WITH CHECK (public.can_manage_blog(auth.uid()));

CREATE POLICY "Blog managers can update review scores"
ON public.album_review_scores FOR UPDATE TO authenticated
USING (public.can_manage_blog(auth.uid()))
WITH CHECK (public.can_manage_blog(auth.uid()));

CREATE POLICY "Blog managers can delete review scores"
ON public.album_review_scores FOR DELETE TO authenticated
USING (public.can_manage_blog(auth.uid()));

CREATE TRIGGER update_album_review_scores_updated_at
BEFORE UPDATE ON public.album_review_scores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_album_review_scores_review ON public.album_review_scores(review_id);
CREATE INDEX idx_album_reviews_album ON public.album_reviews(album_id);