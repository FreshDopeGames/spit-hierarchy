
-- Comprehensive Security Fix Migration - WITH EXISTENCE CHECKS
-- This addresses missing RLS policies, admin access, and data exposure issues

-- Function to create policy if it doesn't exist
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name text,
    table_name text,
    policy_definition text
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = policy_name 
        AND tablename = table_name 
        AND schemaname = 'public'
    ) THEN
        EXECUTE policy_definition;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 1. PUBLIC READABLE TABLES - Add policies for tables that should be readable by everyone

SELECT create_policy_if_not_exists(
    'Anyone can view active achievements',
    'achievements',
    'CREATE POLICY "Anyone can view active achievements" ON public.achievements FOR SELECT USING (is_active = true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view active ad placements',
    'ad_placements',
    'CREATE POLICY "Anyone can view active ad placements" ON public.ad_placements FOR SELECT USING (is_active = true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view blog categories',
    'blog_categories',
    'CREATE POLICY "Anyone can view blog categories" ON public.blog_categories FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view blog tags',
    'blog_tags',
    'CREATE POLICY "Anyone can view blog tags" ON public.blog_tags FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view published blog posts',
    'blog_posts',
    'CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT USING (status = ''published'');'
);

SELECT create_policy_if_not_exists(
    'Anyone can view blog post tags',
    'blog_post_tags',
    'CREATE POLICY "Anyone can view blog post tags" ON public.blog_post_tags FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view official rankings',
    'official_rankings',
    'CREATE POLICY "Anyone can view official rankings" ON public.official_rankings FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view ranking items',
    'ranking_items',
    'CREATE POLICY "Anyone can view ranking items" ON public.ranking_items FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view ranking tags',
    'ranking_tags',
    'CREATE POLICY "Anyone can view ranking tags" ON public.ranking_tags FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view ranking tag assignments',
    'ranking_tag_assignments',
    'CREATE POLICY "Anyone can view ranking tag assignments" ON public.ranking_tag_assignments FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view rappers',
    'rappers',
    'CREATE POLICY "Anyone can view rappers" ON public.rappers FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view rapper images',
    'rapper_images',
    'CREATE POLICY "Anyone can view rapper images" ON public.rapper_images FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view active section headers',
    'section_headers',
    'CREATE POLICY "Anyone can view active section headers" ON public.section_headers FOR SELECT USING (is_active = true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view page templates',
    'page_templates',
    'CREATE POLICY "Anyone can view page templates" ON public.page_templates FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view ranking position history',
    'ranking_position_history',
    'CREATE POLICY "Anyone can view ranking position history" ON public.ranking_position_history FOR SELECT USING (true);'
);

-- 2. USER-SPECIFIC TABLES - Add/fix policies for user isolation

SELECT create_policy_if_not_exists(
    'Anyone can view comments',
    'comments',
    'CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Users can create comments',
    'comments',
    'CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Users can update their own comments',
    'comments',
    'CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Users can delete their own comments',
    'comments',
    'CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view comment likes',
    'comment_likes',
    'CREATE POLICY "Anyone can view comment likes" ON public.comment_likes FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Users can create their own comment likes',
    'comment_likes',
    'CREATE POLICY "Users can create their own comment likes" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Users can delete their own comment likes',
    'comment_likes',
    'CREATE POLICY "Users can delete their own comment likes" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Users can view their own moderation flags',
    'content_moderation_flags',
    'CREATE POLICY "Users can view their own moderation flags" ON public.content_moderation_flags FOR SELECT USING (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Users can create moderation flags',
    'content_moderation_flags',
    'CREATE POLICY "Users can create moderation flags" ON public.content_moderation_flags FOR INSERT WITH CHECK (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view profiles',
    'profiles',
    'CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Users can update their own profile',
    'profiles',
    'CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view public user rankings',
    'user_rankings',
    'CREATE POLICY "Anyone can view public user rankings" ON public.user_rankings FOR SELECT USING (is_public = true OR auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Users can create their own rankings',
    'user_rankings',
    'CREATE POLICY "Users can create their own rankings" ON public.user_rankings FOR INSERT WITH CHECK (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Users can update their own rankings',
    'user_rankings',
    'CREATE POLICY "Users can update their own rankings" ON public.user_rankings FOR UPDATE USING (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Users can delete their own rankings',
    'user_rankings',
    'CREATE POLICY "Users can delete their own rankings" ON public.user_rankings FOR DELETE USING (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view user top rappers',
    'user_top_rappers',
    'CREATE POLICY "Anyone can view user top rappers" ON public.user_top_rappers FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Users can manage their own top rappers',
    'user_top_rappers',
    'CREATE POLICY "Users can manage their own top rappers" ON public.user_top_rappers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view votes',
    'votes',
    'CREATE POLICY "Anyone can view votes" ON public.votes FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Users can create their own votes',
    'votes',
    'CREATE POLICY "Users can create their own votes" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view active voting categories',
    'voting_categories',
    'CREATE POLICY "Anyone can view active voting categories" ON public.voting_categories FOR SELECT USING (active = true);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view ranking votes',
    'ranking_votes',
    'CREATE POLICY "Anyone can view ranking votes" ON public.ranking_votes FOR SELECT USING (true);'
);

SELECT create_policy_if_not_exists(
    'Users can create their own ranking votes',
    'ranking_votes',
    'CREATE POLICY "Users can create their own ranking votes" ON public.ranking_votes FOR INSERT WITH CHECK (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Users can update their own ranking votes',
    'ranking_votes',
    'CREATE POLICY "Users can update their own ranking votes" ON public.ranking_votes FOR UPDATE USING (auth.uid() = user_id);'
);

SELECT create_policy_if_not_exists(
    'Anyone can view official ranking items',
    'official_ranking_items',
    'CREATE POLICY "Anyone can view official ranking items" ON public.official_ranking_items FOR SELECT USING (true);'
);

-- 3. ADMIN-ONLY POLICIES for management

SELECT create_policy_if_not_exists(
    'Admins can manage achievements',
    'achievements',
    'CREATE POLICY "Admins can manage achievements" ON public.achievements FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''));'
);

SELECT create_policy_if_not_exists(
    'Admins can manage ad placements',
    'ad_placements',
    'CREATE POLICY "Admins can manage ad placements" ON public.ad_placements FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''));'
);

SELECT create_policy_if_not_exists(
    'Admins can manage blog categories',
    'blog_categories',
    'CREATE POLICY "Admins can manage blog categories" ON public.blog_categories FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''));'
);

SELECT create_policy_if_not_exists(
    'Admins can manage blog tags',
    'blog_tags',
    'CREATE POLICY "Admins can manage blog tags" ON public.blog_tags FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''));'
);

SELECT create_policy_if_not_exists(
    'Admins and blog editors can manage blog posts',
    'blog_posts',
    'CREATE POLICY "Admins and blog editors can manage blog posts" ON public.blog_posts FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''blog_editor'')));'
);

SELECT create_policy_if_not_exists(
    'Admins can manage official rankings',
    'official_rankings',
    'CREATE POLICY "Admins can manage official rankings" ON public.official_rankings FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''));'
);

SELECT create_policy_if_not_exists(
    'Admins can manage ranking items',
    'ranking_items',
    'CREATE POLICY "Admins can manage ranking items" ON public.ranking_items FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''));'
);

SELECT create_policy_if_not_exists(
    'Admins can manage ranking tags',
    'ranking_tags',
    'CREATE POLICY "Admins can manage ranking tags" ON public.ranking_tags FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''));'
);

SELECT create_policy_if_not_exists(
    'Admins can manage rapper images',
    'rapper_images',
    'CREATE POLICY "Admins can manage rapper images" ON public.rapper_images FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''));'
);

SELECT create_policy_if_not_exists(
    'Admins can manage section headers',
    'section_headers',
    'CREATE POLICY "Admins can manage section headers" ON public.section_headers FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''));'
);

SELECT create_policy_if_not_exists(
    'Admins can manage voting categories',
    'voting_categories',
    'CREATE POLICY "Admins can manage voting categories" ON public.voting_categories FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''));'
);

SELECT create_policy_if_not_exists(
    'Moderators can manage content moderation',
    'content_moderation_flags',
    'CREATE POLICY "Moderators can manage content moderation" ON public.content_moderation_flags FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN (''admin'', ''moderator'')));'
);

SELECT create_policy_if_not_exists(
    'Admins can manage official ranking items',
    'official_ranking_items',
    'CREATE POLICY "Admins can manage official ranking items" ON public.official_ranking_items FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ''admin''));'
);

-- Create a function to check if user is admin for analytics access
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Create app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'blog_editor', 'user');
    END IF;
END $$;

-- Clean up the helper function
DROP FUNCTION create_policy_if_not_exists(text, text, text);
