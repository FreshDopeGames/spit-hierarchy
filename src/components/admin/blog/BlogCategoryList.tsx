
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
        <div key={category.id} className="border border-rap-smoke/30 rounded-lg p-4 hover:border-rap-gold/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-rap-platinum mb-1">{category.name}</h3>
              <p className="text-rap-smoke text-sm mb-2">{category.description}</p>
              <span className="text-xs text-rap-smoke">Slug: {category.slug}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditCategory(category)}
              className="border-rap-smoke text-rap-smoke hover:border-rap-gold hover:text-rap-gold"
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
