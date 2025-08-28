
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import BlogPostFormFields from "./blog/BlogPostFormFields";
import BlogPostMetaFields from "./blog/BlogPostMetaFields";
import BlogPostActions from "./blog/BlogPostActions";
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

  // Reset form when dialog opens/closes or post changes
  useEffect(() => {
    if (post) {
      setFormData(createFormDataFromPost(post));
    } else {
      setFormData(createEmptyFormData());
    }
  }, [post, open]);

  // Save/Update post mutation
  const savePostMutation = useMutation({
    mutationFn: async (data: BlogPostFormData) => {
      const postData = {
        ...data,
        author_id: user?.id,
        published_at: data.status === 'published' ? new Date().toISOString() : null
      };

      if (post) {
        const { data: result, error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
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
