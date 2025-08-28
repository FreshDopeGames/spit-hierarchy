import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "../RichTextEditor";
import BlogPostImageUpload from "./BlogPostImageUpload";
import { BlogPostFormData, generateSlug } from "./BlogPostFormData";
import { sanitizeAdminContent, sanitizeAdminInput } from "@/utils/securityUtils";

interface BlogPostFormFieldsProps {
  formData: BlogPostFormData;
  setFormData: (data: BlogPostFormData | ((prev: BlogPostFormData) => BlogPostFormData)) => void;
  categories?: Array<{ id: string; name: string }>;
}

const BlogPostFormFields = ({ formData, setFormData, categories }: BlogPostFormFieldsProps) => {
  const handleTitleChange = (title: string) => {
    const sanitizedTitle = sanitizeAdminContent(title);
    setFormData(prev => ({
      ...prev,
      title: sanitizedTitle,
      slug: prev.slug || generateSlug(sanitizedTitle)
    }));
  };

  const handleInputChange = (field: keyof BlogPostFormData, value: string) => {
    let sanitizedValue: string;
    
    if (field === 'content' || field === 'excerpt') {
      // Most permissive for rich content
      sanitizedValue = sanitizeAdminContent(value);
    } else if (field === 'slug' || field === 'meta_title' || field === 'meta_description') {
      // Admin input sanitization for meta fields
      sanitizedValue = sanitizeAdminInput(value);
    } else {
      // Default to admin content sanitization
      sanitizedValue = sanitizeAdminContent(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-[var(--theme-text)] text-sm sm:text-base font-[var(--theme-font-body)]">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="text-[var(--theme-text)] text-sm sm:text-base font-[var(--theme-font-body)]">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10"
            placeholder="auto-generated-from-title"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt" className="text-[var(--theme-text)] text-sm sm:text-base font-[var(--theme-font-body)]">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => handleInputChange('excerpt', e.target.value)}
          className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] min-h-[80px]"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-[var(--theme-text)] text-sm sm:text-base font-[var(--theme-font-body)]">Content *</Label>
        <RichTextEditor
          value={formData.content}
          onChange={(content) => handleInputChange('content', content)}
          placeholder="Write your blog post content here... You can use Markdown formatting."
          className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] min-h-[300px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-[var(--theme-text)] text-sm sm:text-base font-[var(--theme-font-body)]">Category</Label>
          <Select 
            value={formData.category_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
          >
            <SelectTrigger className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--theme-background)] border-[var(--theme-border)] max-h-[200px]">
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id} className="text-[var(--theme-text)]">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-[var(--theme-text)] text-sm sm:text-base font-[var(--theme-font-body)]">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--theme-background)] border-[var(--theme-border)]">
              <SelectItem value="draft" className="text-[var(--theme-text)]">Draft</SelectItem>
              <SelectItem value="published" className="text-[var(--theme-text)]">Published</SelectItem>
              <SelectItem value="archived" className="text-[var(--theme-text)]">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <BlogPostImageUpload
        imageUrl={formData.featured_image_url}
        onImageChange={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
      />

      <div className="space-y-2">
        <Label htmlFor="video_url" className="text-[var(--theme-text)] text-sm sm:text-base font-[var(--theme-font-body)]">Video URL (optional)</Label>
        <Input
          id="video_url"
          value={formData.video_url}
          onChange={(e) => handleInputChange('video_url', e.target.value)}
          className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10"
          placeholder="https://example.com/video.mp4"
          type="url"
        />
        <p className="text-xs text-[var(--theme-text-secondary)] font-[var(--theme-font-body)]">If provided, this video will be displayed instead of the featured image on the blog detail page</p>
      </div>

      <div className="flex items-center space-x-3 p-3 bg-[var(--theme-surface)] rounded border border-[var(--theme-border)]">
        <Switch
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
        />
        <Label htmlFor="featured" className="text-[var(--theme-text)] text-sm sm:text-base font-[var(--theme-font-body)]">Featured Post</Label>
      </div>
    </>
  );
};

export default BlogPostFormFields;
