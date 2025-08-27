
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
        <div className="mb-6 p-4 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[var(--theme-primary)] font-[var(--theme-fontSecondary)]">Active filters:</span>
              {selectedCategory !== 'all' && (
                <Badge variant="outline" className="border-[var(--theme-primary)] text-[var(--theme-primary)]">
                  Category: {categories?.find(c => c.id === selectedCategory)?.name}
                </Badge>
              )}
              {selectedTag && (
                <Badge variant="outline" className="border-[var(--theme-accent)] text-[var(--theme-accent)]">
                  <Tag className="w-3 h-3 mr-1" />
                  Tag: {tags?.find(t => t.slug === selectedTag)?.name}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-[var(--theme-textMuted)] hover:text-[var(--theme-primary)]">
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Filter Dropdowns - Side by side on tablet+ */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Filter Dropdown */}
        <div>
          <h2 className="text-2xl font-[var(--theme-fontPrimary)] text-[var(--theme-primary)] mb-4">Filter by Category</h2>
          <Select value={selectedCategory || 'all'} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full md:w-64 bg-[var(--theme-backgroundLight)] border-2 border-[var(--theme-primary)]/50 text-[var(--theme-primary)]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--theme-surface)] border-[var(--theme-border)]">
              <SelectItem value="all" className="text-[var(--theme-text)]">All Posts</SelectItem>
              {categories?.map(category => (
                <SelectItem key={category.id} value={category.id} className="text-[var(--theme-text)]">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tag Filter Dropdown */}
        {tags && tags.length > 0 && (
          <div>
            <h2 className="text-2xl font-[var(--theme-fontPrimary)] text-[var(--theme-primary)] mb-4">Filter by Tag</h2>
            <Select value={selectedTag || 'all'} onValueChange={onTagChange}>
              <SelectTrigger className="w-full md:w-64 bg-[var(--theme-backgroundLight)] border-2 border-[var(--theme-accent)]/50 text-[var(--theme-accent)]">
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--theme-surface)] border-[var(--theme-border)]">
                <SelectItem value="all" className="text-[var(--theme-text)]">All Tags</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.slug} className="text-[var(--theme-text)]">
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogFilters;
