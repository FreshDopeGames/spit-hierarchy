
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface BlogCategoryListProps {
  categories: any[] | undefined;
  onEditCategory: (category: any) => void;
}

const BlogCategoryList = ({ categories, onEditCategory }: BlogCategoryListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories?.map(category => (
        <div key={category.id} className="border border-[var(--theme-border)] rounded-lg p-4 hover:border-[var(--theme-primary)]/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-1 font-[var(--theme-font-heading)]">{category.name}</h3>
              <p className="text-[var(--theme-text-secondary)] text-sm mb-2 font-[var(--theme-font-body)]">{category.description}</p>
              <span className="text-xs text-[var(--theme-text-secondary)] font-[var(--theme-font-body)]">Slug: {category.slug}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditCategory(category)}
              className="border-[var(--theme-border)] text-[var(--theme-text)] hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogCategoryList;
