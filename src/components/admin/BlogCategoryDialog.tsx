
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlogCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: any;
  onSuccess: () => void;
}

const BlogCategoryDialog = ({
  open,
  onOpenChange,
  category,
  onSuccess
}: BlogCategoryDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || ''
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: ''
      });
    }
  }, [category, open]);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  };

  // Save/Update category mutation
  const saveCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      if (category) {
        const {
          data: result,
          error
        } = await supabase.from('blog_categories').update(data).eq('id', category.id).select().single();
        if (error) throw error;
        return result;
      } else {
        const {
          data: result,
          error
        } = await supabase.from('blog_categories').insert([data]).select().single();
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      toast.success(category ? 'Category updated successfully' : 'Category created successfully');
      onSuccess();
    },
    onError: error => {
      toast.error('Error saving category: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }
    const slug = formData.slug || generateSlug(formData.name);
    saveCategoryMutation.mutate({
      ...formData,
      slug
    });
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md bg-[var(--theme-surface)] border border-[var(--theme-border)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] text-lg sm:text-2xl">
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[var(--theme-text)] text-sm sm:text-base">Name *</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={e => handleNameChange(e.target.value)} 
              className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-[var(--theme-text)] text-sm sm:text-base">Slug</Label>
            <Input 
              id="slug" 
              value={formData.slug} 
              onChange={e => setFormData(prev => ({
                ...prev,
                slug: e.target.value
              }))} 
              className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10" 
              placeholder="auto-generated-from-name" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[var(--theme-text)] text-sm sm:text-base">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={e => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))} 
              className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] min-h-[80px]" 
              rows={3} 
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={saveCategoryMutation.isPending} 
              className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 text-[var(--theme-background)] font-[var(--theme-font-heading)] h-11 flex-1 sm:flex-none mx-[10px]"
            >
              {saveCategoryMutation.isPending ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="border-[var(--theme-border)] text-[var(--theme-text)] hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] h-11 flex-1 sm:flex-none font-[var(--theme-font-heading)] text-base"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogCategoryDialog;
