
-- Phase 1: RLS Policy Cleanup & Security Hardening (Fixed)
-- First, let's clean up duplicate and fix missing policies

-- Drop existing problematic policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can view active achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievements;

DROP POLICY IF EXISTS "Anyone can view active ad placements" ON public.ad_placements;
DROP POLICY IF EXISTS "Admins can manage ad placements" ON public.ad_placements;

DROP POLICY IF EXISTS "Anyone can view blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Admins can manage blog categories" ON public.blog_categories;

DROP POLICY IF EXISTS "Anyone can view blog tags" ON public.blog_tags;
DROP POLICY IF EXISTS "Admins can manage blog tags" ON public.blog_tags;

DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins and blog editors can manage blog posts" ON public.blog_posts;

DROP POLICY IF EXISTS "Anyone can view blog post tags" ON public.blog_post_tags;

DROP POLICY IF EXISTS "Anyone can view official rankings" ON public.official_rankings;
DROP POLICY IF EXISTS "Admins can manage official rankings" ON public.official_rankings;

DROP POLICY IF EXISTS "Anyone can view ranking items" ON public.ranking_items;
DROP POLICY IF EXISTS "Admins can manage ranking items" ON public.ranking_items;

DROP POLICY IF EXISTS "Anyone can view ranking tags" ON public.ranking_tags;
DROP POLICY IF EXISTS "Admins can manage ranking tags" ON public.ranking_tags;

DROP POLICY IF EXISTS "Anyone can view ranking tag assignments" ON public.ranking_tag_assignments;

DROP POLICY IF EXISTS "Anyone can view rappers" ON public.rappers;

DROP POLICY IF EXISTS "Anyone can view rapper images" ON public.rapper_images;
DROP POLICY IF EXISTS "Admins can manage rapper images" ON public.rapper_images;

DROP POLICY IF EXISTS "Anyone can view active section headers" ON public.section_headers;
DROP POLICY IF EXISTS "Admins can manage section headers" ON public.section_headers;

DROP POLICY IF EXISTS "Anyone can view ranking position history" ON public.ranking_position_history;

-- User-specific table policies cleanup
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

DROP POLICY IF EXISTS "Anyone can view comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can create their own comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can delete their own comment likes" ON public.comment_likes;

DROP POLICY IF EXISTS "Users can view their own moderation flags" ON public.content_moderation_flags;
DROP POLICY IF EXISTS "Users can create moderation flags" ON public.content_moderation_flags;
DROP POLICY IF EXISTS "Moderators can manage content moderation" ON public.content_moderation_flags;

DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view public user rankings" ON public.user_rankings;
DROP POLICY IF EXISTS "Users can create their own rankings" ON public.user_rankings;
DROP POLICY IF EXISTS "Users can update their own rankings" ON public.user_rankings;
DROP POLICY IF EXISTS "Users can delete their own rankings" ON public.user_rankings;

DROP POLICY IF EXISTS "Anyone can view user top rappers" ON public.user_top_rappers;
DROP POLICY IF EXISTS "Users can manage their own top rappers" ON public.user_top_rappers;

DROP POLICY IF EXISTS "Anyone can view votes" ON public.votes;
DROP POLICY IF EXISTS "Users can create their own votes" ON public.votes;

DROP POLICY IF EXISTS "Anyone can view active voting categories" ON public.voting_categories;
DROP POLICY IF EXISTS "Admins can manage voting categories" ON public.voting_categories;

DROP POLICY IF EXISTS "Anyone can view ranking votes" ON public.ranking_votes;
DROP POLICY IF EXISTS "Users can create their own ranking votes" ON public.ranking_votes;
DROP POLICY IF EXISTS "Users can update their own ranking votes" ON public.ranking_votes;

DROP POLICY IF EXISTS "Anyone can view official ranking items" ON public.official_ranking_items;
DROP POLICY IF EXISTS "Admins can manage official ranking items" ON public.official_ranking_items;

-- Create standardized security functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_blog_content()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'blog_editor')
  );
$$;

-- Now create secure, standardized policies

-- PUBLIC READABLE TABLES (with proper admin management)
CREATE POLICY "Public read access" ON public.achievements FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access" ON public.achievements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read access" ON public.ad_placements FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access" ON public.ad_placements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read access" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.blog_categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read access" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.blog_tags FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read published posts" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Blog editors full access" ON public.blog_posts FOR ALL USING (public.can_manage_blog_content()) WITH CHECK (public.can_manage_blog_content());

CREATE POLICY "Public read access" ON public.blog_post_tags FOR SELECT USING (true);

CREATE POLICY "Public read access" ON public.official_rankings FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.official_rankings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read access" ON public.ranking_items FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.ranking_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read access" ON public.ranking_tags FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.ranking_tags FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read access" ON public.ranking_tag_assignments FOR SELECT USING (true);

CREATE POLICY "Public read access" ON public.rappers FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.rappers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read access" ON public.rapper_images FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.rapper_images FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read active headers" ON public.section_headers FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access" ON public.section_headers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read access" ON public.page_templates FOR SELECT USING (true);

CREATE POLICY "Public read access" ON public.ranking_position_history FOR SELECT USING (true);

CREATE POLICY "Public read active categories" ON public.voting_categories FOR SELECT USING (active = true);
CREATE POLICY "Admin full access" ON public.voting_categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read access" ON public.official_ranking_items FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.official_ranking_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- USER-SPECIFIC TABLES (with proper isolation and security)
CREATE POLICY "Public read access" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users create own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "Users update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public read access" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Users create own likes" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "Users delete own likes" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users view own flags" ON public.content_moderation_flags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create flags" ON public.content_moderation_flags FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "Moderators manage flags" ON public.content_moderation_flags FOR ALL USING (public.is_moderator_or_admin()) WITH CHECK (public.is_moderator_or_admin());

CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Public read public rankings" ON public.user_rankings FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users create own rankings" ON public.user_rankings FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "Users update own rankings" ON public.user_rankings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own rankings" ON public.user_rankings FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public read user top rappers" ON public.user_top_rappers FOR SELECT USING (true);
CREATE POLICY "Users manage own top rappers" ON public.user_top_rappers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Public read votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Users create own votes" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Public read ranking votes" ON public.ranking_votes FOR SELECT USING (true);
CREATE POLICY "Users create own ranking votes" ON public.ranking_votes FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "Users update own ranking votes" ON public.ranking_votes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add performance indexes for high-traffic queries (without CONCURRENTLY to avoid transaction block issues)
CREATE INDEX IF NOT EXISTS idx_votes_user_id_created_at ON public.votes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_rapper_id_created_at ON public.votes (rapper_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ranking_votes_user_id ON public.ranking_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_ranking_votes_ranking_rapper ON public.ranking_votes (ranking_id, rapper_id);
CREATE INDEX IF NOT EXISTS idx_comments_content_type_id ON public.comments (content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements (user_id);
CREATE INDEX IF NOT EXISTS idx_member_stats_status ON public.member_stats (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON public.blog_posts (status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_user_rankings_public_created ON public.user_rankings (is_public, created_at DESC) WHERE is_public = true;

-- Add rate limiting function for sensitive operations
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  action_type TEXT,
  user_uuid UUID DEFAULT auth.uid(),
  max_requests INTEGER DEFAULT 10,
  window_seconds INTEGER DEFAULT 3600
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  request_count INTEGER;
  window_start TIMESTAMP;
BEGIN
  IF user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  window_start := NOW() - (window_seconds || ' seconds')::INTERVAL;
  
  -- Count recent requests (this is a simplified version - in production you'd use a proper rate limiting table)
  SELECT COUNT(*) INTO request_count
  FROM public.votes v
  WHERE v.user_id = user_uuid 
    AND v.created_at > window_start
    AND action_type = 'vote';
  
  RETURN request_count < max_requests;
END;
$$;

-- Create audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admin read audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only log for authenticated users and sensitive tables
  IF auth.uid() IS NOT NULL AND TG_TABLE_NAME IN ('user_roles', 'blog_posts', 'official_rankings', 'rappers') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_blog_posts ON public.blog_posts;
CREATE TRIGGER audit_blog_posts
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_official_rankings ON public.official_rankings;
CREATE TRIGGER audit_official_rankings
  AFTER INSERT OR UPDATE OR DELETE ON public.official_rankings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_rappers ON public.rappers;
CREATE TRIGGER audit_rappers
  AFTER INSERT OR UPDATE OR DELETE ON public.rappers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
