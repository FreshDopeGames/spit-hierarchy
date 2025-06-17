
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlogPostFormData } from "./BlogPostFormData";

interface BlogPostMetaFieldsProps {
  formData: BlogPostFormData;
  setFormData: (data: BlogPostFormData | ((prev: BlogPostFormData) => BlogPostFormData)) => void;
}

const BlogPostMetaFields = ({ formData, setFormData }: BlogPostMetaFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="meta_title" className="text-rap-platinum text-sm sm:text-base">SEO Title</Label>
        <Input
          id="meta_title"
          value={formData.meta_title}
          onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
          className="bg-gray-100 border-rap-smoke text-rap-carbon h-11 sm:h-10"
          placeholder="Defaults to post title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_description" className="text-rap-platinum text-sm sm:text-base">SEO Description</Label>
        <Input
          id="meta_description"
          value={formData.meta_description}
          onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
          className="bg-gray-100 border-rap-smoke text-rap-carbon h-11 sm:h-10"
          placeholder="SEO meta description"
        />
      </div>
    </div>
  );
};

export default BlogPostMetaFields;
