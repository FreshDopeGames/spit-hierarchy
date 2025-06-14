
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    meta_title: '',
    meta_description: '',
    featured_image_url: '',
    category_id: '',
    status: 'draft',
    featured: false
  });

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
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        featured_image_url: post.featured_image_url || '',
        category_id: post.category_id || '',
        status: post.status || 'draft',
        featured: post.featured || false
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        meta_title: '',
        meta_description: '',
        featured_image_url: '',
        category_id: '',
        status: 'draft',
        featured: false
      });
    }
  }, [post, open]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Save/Update post mutation
  const savePostMutation = useMutation({
    mutationFn: async (data: any) => {
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

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-carbon-fiber border border-rap-gold/30 bg-black">
        <DialogHeader>
          <DialogTitle className="text-rap-gold font-ceviche font-thin text-2xl sm:text-4xl">
            {post ? 'Edit Post' : 'Create New Post'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-rap-platinum text-sm sm:text-base">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="bg-rap-carbon border-rap-smoke text-rap-platinum h-11 sm:h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-rap-platinum text-sm sm:text-base">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="bg-rap-carbon border-rap-smoke text-rap-platinum h-11 sm:h-10"
                placeholder="auto-generated-from-title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-rap-platinum text-sm sm:text-base">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              className="bg-rap-carbon border-rap-smoke text-rap-platinum min-h-[80px]"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-rap-platinum text-sm sm:text-base">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="bg-rap-carbon border-rap-smoke text-rap-platinum min-h-[200px] sm:min-h-[250px]"
              rows={10}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-rap-platinum text-sm sm:text-base">Category</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger className="bg-rap-carbon border-rap-smoke text-rap-platinum h-11 sm:h-10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-rap-carbon border-rap-smoke max-h-[200px]">
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-rap-platinum">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-rap-platinum text-sm sm:text-base">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-rap-carbon border-rap-smoke text-rap-platinum h-11 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-rap-carbon border-rap-smoke">
                  <SelectItem value="draft" className="text-rap-platinum">Draft</SelectItem>
                  <SelectItem value="published" className="text-rap-platinum">Published</SelectItem>
                  <SelectItem value="archived" className="text-rap-platinum">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="featured_image" className="text-rap-platinum text-sm sm:text-base">Featured Image URL</Label>
            <Input
              id="featured_image"
              value={formData.featured_image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
              className="bg-rap-carbon border-rap-smoke text-rap-platinum h-11 sm:h-10"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center space-x-3 p-3 bg-rap-carbon/30 rounded">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
            />
            <Label htmlFor="featured" className="text-rap-platinum text-sm sm:text-base">Featured Post</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title" className="text-rap-platinum text-sm sm:text-base">SEO Title</Label>
              <Input
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                className="bg-rap-carbon border-rap-smoke text-rap-platinum h-11 sm:h-10"
                placeholder="Defaults to post title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description" className="text-rap-platinum text-sm sm:text-base">SEO Description</Label>
              <Input
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                className="bg-rap-carbon border-rap-smoke text-rap-platinum h-11 sm:h-10"
                placeholder="SEO meta description"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={savePostMutation.isPending}
              className="bg-rap-gold font-mogra text-black text-lg h-12 sm:h-11 flex-1 sm:flex-none"
            >
              {savePostMutation.isPending ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-rap-smoke text-rap-smoke hover:border-rap-gold hover:text-rap-gold h-12 sm:h-11 flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPostDialog;
