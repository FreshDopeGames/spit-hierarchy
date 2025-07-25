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
          <Label htmlFor="title" className="text-rap-platinum text-sm sm:text-base">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="bg-gray-100 border-rap-smoke text-rap-carbon h-11 sm:h-10"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="text-rap-platinum text-sm sm:text-base">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            className="bg-gray-100 border-rap-smoke text-rap-carbon h-11 sm:h-10"
            placeholder="auto-generated-from-title"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt" className="text-rap-platinum text-sm sm:text-base">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => handleInputChange('excerpt', e.target.value)}
          className="bg-gray-100 border-rap-smoke text-rap-carbon min-h-[80px]"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-rap-platinum text-sm sm:text-base">Content *</Label>
        <RichTextEditor
          value={formData.content}
          onChange={(content) => handleInputChange('content', content)}
          placeholder="Write your blog post content here... You can use Markdown formatting."
          className="bg-gray-100 border-rap-smoke text-rap-carbon min-h-[300px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-rap-platinum text-sm sm:text-base">Category</Label>
          <Select 
            value={formData.category_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
          >
            <SelectTrigger className="bg-gray-100 border-rap-smoke text-rap-carbon h-11 sm:h-10">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 border-rap-smoke max-h-[200px]">
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id} className="text-rap-carbon">
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
            <SelectTrigger className="bg-gray-100 border-rap-smoke text-rap-carbon h-11 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-100 border-rap-smoke">
              <SelectItem value="draft" className="text-rap-carbon">Draft</SelectItem>
              <SelectItem value="published" className="text-rap-carbon">Published</SelectItem>
              <SelectItem value="archived" className="text-rap-carbon">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <BlogPostImageUpload
        imageUrl={formData.featured_image_url}
        onImageChange={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
      />

      <div className="space-y-2">
        <Label htmlFor="video_url" className="text-rap-platinum text-sm sm:text-base">Video URL (optional)</Label>
        <Input
          id="video_url"
          value={formData.video_url}
          onChange={(e) => handleInputChange('video_url', e.target.value)}
          className="bg-gray-100 border-rap-smoke text-rap-carbon h-11 sm:h-10"
          placeholder="https://example.com/video.mp4"
          type="url"
        />
        <p className="text-xs text-rap-smoke">If provided, this video will be displayed instead of the featured image on the blog detail page</p>
      </div>

      <div className="flex items-center space-x-3 p-3 bg-rap-carbon/30 rounded">
        <Switch
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
        />
        <Label htmlFor="featured" className="text-rap-platinum text-sm sm:text-base">Featured Post</Label>
      </div>
    </>
  );
};

export default BlogPostFormFields;
