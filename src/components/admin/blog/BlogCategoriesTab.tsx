
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BlogCategoryList from "./BlogCategoryList";

interface BlogCategoriesTabProps {
  onEditCategory: (category: any) => void;
  onNewCategory: () => void;
}

const BlogCategoriesTab = ({ onEditCategory, onNewCategory }: BlogCategoriesTabProps) => {
  // Fetch categories
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

  return (
    <Card className="bg-[var(--theme-surface)] border border-[var(--theme-border)]">
      <CardHeader>
        <CardTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-4 text-center text-2xl">Categories</CardTitle>
        <div className="flex justify-between items-center">
          <div className="flex-1"></div>
          <Button 
            onClick={onNewCategory} 
            className="bg-[var(--theme-primary)] text-[var(--theme-background)] hover:bg-[var(--theme-primary)]/90 font-[var(--theme-font-heading)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <BlogCategoryList
          categories={categories}
          onEditCategory={onEditCategory}
        />
      </CardContent>
    </Card>
  );
};

export default BlogCategoriesTab;
