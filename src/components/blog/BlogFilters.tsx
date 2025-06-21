
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

interface BlogFiltersProps {
  categories?: BlogCategory[];
  tags?: BlogTag[];
  selectedCategory: string;
  selectedTag: string;
  onCategoryChange: (categoryId: string) => void;
  onTagChange: (tagSlug: string) => void;
  onClearFilters: () => void;
}

const BlogFilters = ({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  onCategoryChange,
  onTagChange,
  onClearFilters
}: BlogFiltersProps) => {
  return (
    <>
      {/* Active Filters */}
      {(selectedCategory !== 'all' || selectedTag) && (
        <div className="mb-6 p-4 bg-carbon-fiber border border-rap-gold/40 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-rap-gold font-kaushan">Active filters:</span>
              {selectedCategory !== 'all' && (
                <Badge variant="outline" className="border-rap-gold text-rap-gold">
                  Category: {categories?.find(c => c.id === selectedCategory)?.name}
                </Badge>
              )}
              {selectedTag && (
                <Badge variant="outline" className="border-rap-forest text-rap-forest">
                  <Tag className="w-3 h-3 mr-1" />
                  Tag: {tags?.find(t => t.slug === selectedTag)?.name}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-rap-silver hover:text-rap-gold">
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Category Filter Dropdown */}
      <div className="mb-8">
        <h2 className="text-2xl font-ceviche text-rap-gold mb-4">Filter by Category</h2>
        <Select value={selectedCategory || 'all'} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-64 bg-rap-carbon-light border-2 border-rap-gold/50 text-rap-gold">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-rap-carbon border-rap-gold/50">
            <SelectItem value="all" className="text-rap-gold">All Posts</SelectItem>
            {categories?.map(category => (
              <SelectItem key={category.id} value={category.id} className="text-rap-gold">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tag Filter Dropdown */}
      {tags && tags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-ceviche text-rap-gold mb-4">Filter by Tag</h2>
          <Select value={selectedTag || 'all'} onValueChange={onTagChange}>
            <SelectTrigger className="w-64 bg-rap-carbon-light border-2 border-rap-forest/50 text-rap-forest">
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent className="bg-rap-carbon border-rap-forest/50">
              <SelectItem value="all" className="text-rap-forest">All Tags</SelectItem>
              {tags.map(tag => (
                <SelectItem key={tag.id} value={tag.slug} className="text-rap-forest">
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};

export default BlogFilters;
