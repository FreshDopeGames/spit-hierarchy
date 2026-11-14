-- 1. Storage: blog-images writes restricted to blog managers
DROP POLICY IF EXISTS "Authenticated upload access for blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for blog images" ON storage.objects;
DROP POLICY IF EXISTS "Blog editors can upload blog images" ON storage.objects;
CREATE POLICY "Blog editors can upload blog images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND public.can_manage_blog_content());

-- 2. Remove redundant tautology policies where a real predicate already exists
DROP POLICY IF EXISTS "Ad placements are viewable by everyone" ON public.ad_placements;
DROP POLICY IF EXISTS "Anyone can view voting categories" ON public.voting_categories;
DROP POLICY IF EXISTS "Anyone can view page templates" ON public.page_templates;
DROP POLICY IF EXISTS "Page templates are viewable by everyone" ON public.page_templates;
DROP POLICY IF EXISTS "Public read access" ON public.page_templates;
DROP POLICY IF EXISTS "Anyone can view published categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Anyone can view tags" ON public.blog_tags;

-- 3. Blog post tags: only for published posts (or blog managers)
DROP POLICY IF EXISTS "Anyone can view post tags" ON public.blog_post_tags;
DROP POLICY IF EXISTS "Public read access" ON public.blog_post_tags;
CREATE POLICY "Public read tags of published posts" ON public.blog_post_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.blog_posts p WHERE p.id = blog_post_tags.post_id AND p.status = 'published')
    OR public.can_manage_blog_content()
  );

-- 4. Discography fetch progress: only recent rows (or admins)
DROP POLICY IF EXISTS "Anyone can view fetch progress" ON public.discography_fetch_progress;
CREATE POLICY "Public read recent fetch progress" ON public.discography_fetch_progress
  FOR SELECT USING (updated_at > now() - interval '2 hours' OR public.is_admin());

-- 5. Rapper-linked tables: only rows for published rappers (or staff)
DROP POLICY IF EXISTS "Public read rapper albums" ON public.rapper_albums;
CREATE POLICY "Public read rapper albums" ON public.rapper_albums FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rappers r WHERE r.id = rapper_albums.rapper_id AND r.publish_status = 'published')
  OR public.is_moderator_or_admin());

DROP POLICY IF EXISTS "Public read rapper singles" ON public.rapper_singles;
CREATE POLICY "Public read rapper singles" ON public.rapper_singles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rappers r WHERE r.id = rapper_singles.rapper_id AND r.publish_status = 'published')
  OR public.is_moderator_or_admin());

DROP POLICY IF EXISTS "Public read rapper labels" ON public.rapper_labels;
CREATE POLICY "Public read rapper labels" ON public.rapper_labels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rappers r WHERE r.id = rapper_labels.rapper_id AND r.publish_status = 'published')
  OR public.is_moderator_or_admin());

DROP POLICY IF EXISTS "Public read access on rapper_tag_assignments" ON public.rapper_tag_assignments;
CREATE POLICY "Public read access on rapper_tag_assignments" ON public.rapper_tag_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rappers r WHERE r.id = rapper_tag_assignments.rapper_id AND r.publish_status = 'published')
  OR public.is_moderator_or_admin());

DROP POLICY IF EXISTS "Public can view rapper images" ON public.rapper_images;
CREATE POLICY "Public can view rapper images" ON public.rapper_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rappers r WHERE r.id = rapper_images.rapper_id AND r.publish_status = 'published')
  OR public.is_moderator_or_admin());

DROP POLICY IF EXISTS "Media mentions are publicly readable" ON public.rapper_media_mentions;
CREATE POLICY "Media mentions are publicly readable" ON public.rapper_media_mentions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rappers r WHERE r.id = rapper_media_mentions.rapper_id AND r.publish_status = 'published')
  OR public.is_moderator_or_admin());

DROP POLICY IF EXISTS "Trending rappers are viewable by everyone" ON public.trending_rappers;
CREATE POLICY "Trending rappers are viewable by everyone" ON public.trending_rappers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rappers r WHERE r.id = trending_rappers.rapper_id AND r.publish_status = 'published')
  OR public.is_moderator_or_admin());

DROP POLICY IF EXISTS "Rapper collaborations are publicly readable" ON public.rapper_collaborations;
CREATE POLICY "Rapper collaborations are publicly readable" ON public.rapper_collaborations FOR SELECT USING (
  (EXISTS (SELECT 1 FROM public.rappers r WHERE r.id = rapper_collaborations.rapper_id AND r.publish_status = 'published')
   AND EXISTS (SELECT 1 FROM public.rappers c WHERE c.id = rapper_collaborations.collaborator_id AND c.publish_status = 'published'))
  OR public.is_moderator_or_admin());

DROP POLICY IF EXISTS "Public read access" ON public.ranking_items;
CREATE POLICY "Public read access" ON public.ranking_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rappers r WHERE r.id = ranking_items.rapper_id AND r.publish_status = 'published')
  OR public.is_moderator_or_admin());

DROP POLICY IF EXISTS "Public read access" ON public.official_ranking_items;
CREATE POLICY "Public read access" ON public.official_ranking_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rappers r WHERE r.id = official_ranking_items.rapper_id AND r.publish_status = 'published')
  OR public.is_moderator_or_admin());

DROP POLICY IF EXISTS "Public read access" ON public.ranking_position_history;
CREATE POLICY "Public read access" ON public.ranking_position_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.rappers r WHERE r.id = ranking_position_history.rapper_id AND r.publish_status = 'published')
  OR public.is_moderator_or_admin());