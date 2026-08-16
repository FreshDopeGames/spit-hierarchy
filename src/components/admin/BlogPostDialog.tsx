
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import BlogPostFormFields from "./blog/BlogPostFormFields";
import BlogPostMetaFields from "./blog/BlogPostMetaFields";
import BlogPostActions from "./blog/BlogPostActions";
import BlogPostAlbumReview, {
  AlbumReviewFormState,
  createEmptyAlbumReviewState,
} from "./blog/BlogPostAlbumReview";
import { useAlbumReviewByPost, useSaveAlbumReview, useDeleteAlbumReview } from "@/hooks/useAlbumReview";
import { 
  BlogPostFormData, 
  createEmptyFormData, 
  createFormDataFromPost, 
  generateSlug 
} from "./blog/BlogPostFormData";

interface BlogPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: any;
  onSuccess: () => void;
}

const BlogPostDialog = ({
  open,
  onOpenChange,
  post,
  onSuccess
}: BlogPostDialogProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<BlogPostFormData>(createEmptyFormData());
  const [reviewState, setReviewState] = useState<AlbumReviewFormState>(createEmptyAlbumReviewState());

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Existing album review for this post (if any)
  const { data: existingReview } = useAlbumReviewByPost(post?.id);
  const saveReview = useSaveAlbumReview();
  const deleteReview = useDeleteAlbumReview();

  // Reset form when dialog opens/closes or post changes
  useEffect(() => {
    if (post) {
      setFormData(createFormDataFromPost(post));
    } else {
      setFormData(createEmptyFormData());
    }
    setReviewState(createEmptyAlbumReviewState());
  }, [post, open]);

  // Hydrate the review section once the existing review loads
  useEffect(() => {
    if (!open) return;
    if (!existingReview) return;
    setReviewState({
      enabled: true,
      albumId: existingReview.album_id,
      albumTitle: existingReview.album?.title || '',
      albumArtist: existingReview.album?.rapper_name || '',
      albumCover: existingReview.album?.cached_cover_url || existingReview.album?.cover_art_url || null,
      overallScore: String(existingReview.overall_score),
      verdict: existingReview.verdict || '',
      scores: Object.fromEntries(existingReview.scores.map((s) => [s.category_id, s.score])),
    });
  }, [existingReview, open]);

  // Save/Update post mutation
  const savePostMutation = useMutation({
    mutationFn: async (data: BlogPostFormData) => {
      const publishedAt = data.status === 'published'
        ? (data.published_at || new Date().toISOString())
        : null;

      const postData = {
        ...data,
        author_id: user?.id,
        published_at: publishedAt
      };

      let saved: any;

      if (post) {
        const { data: result, error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id)
          .select()
          .single();
        
        if (error) throw error;
        saved = result;
      } else {
        const { data: result, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();
        
        if (error) throw error;
        saved = result;
      }

      // Album review is saved alongside the post so drafts keep their scores
      if (reviewState.enabled && reviewState.albumId) {
        const score = parseFloat(reviewState.overallScore);
        if (!Number.isFinite(score) || score < 0.5 || score > 5 || (score * 2) % 1 !== 0) {
          throw new Error('Official score must be between 0.5 and 5.0 in half-star steps');
        }
        await saveReview.mutateAsync({
          blogPostId: saved.id,
          albumId: reviewState.albumId,
          overallScore: score,
          verdict: reviewState.verdict,
          reviewerId: user?.id ?? null,
          scores: Object.entries(reviewState.scores).map(([categoryId, s]) => ({
            categoryId,
            score: s,
          })),
        });
      } else if (existingReview) {
        await deleteReview.mutateAsync(saved.id);
      }

      return saved;
    },
    onSuccess: () => {
      toast.success(post ? 'Post updated successfully' : 'Post created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Error saving post: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    if (reviewState.enabled && !reviewState.albumId) {
      toast.error('Attach an album or turn off the album review toggle');
      return;
    }

    const slug = formData.slug || generateSlug(formData.title);
    
    savePostMutation.mutate({
      ...formData,
      slug,
      meta_title: formData.meta_title || formData.title
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--theme-surface)] border border-[var(--theme-border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] font-thin text-2xl sm:text-4xl">
            {post ? 'Edit Post' : 'Create New Post'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <BlogPostFormFields 
            formData={formData}
            setFormData={setFormData}
            categories={categories}
          />

          <BlogPostAlbumReview
            value={reviewState}
            onChange={setReviewState}
          />

          <BlogPostMetaFields 
            formData={formData}
            setFormData={setFormData}
          />

          <BlogPostActions 
            isEditing={!!post}
            isLoading={savePostMutation.isPending}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostDialog;
