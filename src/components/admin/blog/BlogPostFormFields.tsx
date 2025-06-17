
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "../RichTextEditor";
import { BlogPostFormData, generateSlug } from "./BlogPostFormData";

interface BlogPostFormFieldsProps {
  formData: BlogPostFormData;
  setFormData: (data: BlogPostFormData | ((prev: BlogPostFormData) => BlogPostFormData)) => void;
  categories?: Array<{ id: string; name: string }>;
}

const BlogPostFormFields = ({ formData, setFormData, categories }: BlogPostFormFieldsProps) => {
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
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
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          className="bg-gray-100 border-rap-smoke text-rap-carbon min-h-[80px]"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-rap-platinum text-sm sm:text-base">Content *</Label>
        <RichTextEditor
          value={formData.content}
          onChange={(content) => setFormData(prev => ({ ...prev, content }))}
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

      <div className="space-y-2">
        <Label htmlFor="featured_image" className="text-rap-platinum text-sm sm:text-base">Featured Image URL</Label>
        <Input
          id="featured_image"
          value={formData.featured_image_url}
          onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
          className="bg-gray-100 border-rap-smoke text-rap-carbon h-11 sm:h-10"
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
    </>
  );
};

export default BlogPostFormFields;
