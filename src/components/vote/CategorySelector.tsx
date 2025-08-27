
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";
type VotingCategory = Tables<"voting_categories">;

interface CategorySelectorProps {
  categoryId: string;
  setCategoryId: (categoryId: string) => void;
  categories: VotingCategory[] | undefined;
  selectedCategoryData: VotingCategory | undefined;
}

const CategorySelector = ({
  categoryId,
  setCategoryId,
  categories,
  selectedCategoryData
}: CategorySelectorProps) => {
  // Filter out the "Overall" category since it should be calculated, not voted on
  const filteredCategories = categories?.filter(category => category.name !== "Overall");

  return (
    <div className="space-y-2">
      <Label htmlFor="category" className="text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)]">
        Skill Category
      </Label>
      <Select value={categoryId} onValueChange={setCategoryId}>
        <SelectTrigger className="bg-[var(--theme-surface)]/50 border-[var(--theme-primary)]/30 text-[var(--theme-text)] font-[var(--theme-fontSecondary)] min-h-[2.5rem] [&>span]:!text-clip [&>span]:!whitespace-normal [&>span]:!line-clamp-none">
          <SelectValue placeholder="Select a skill to rate..." />
        </SelectTrigger>
        <SelectContent className="bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text)]">
          {filteredCategories?.map(category => (
            <SelectItem 
              key={category.id} 
              value={category.id} 
              className="font-[var(--theme-fontSecondary)] focus:bg-[var(--theme-surface)] focus:text-[var(--theme-text)]"
            >
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedCategoryData && (
        <p className="text-sm font-[var(--theme-fontSecondary)] text-[var(--theme-primary)]">{selectedCategoryData.description}</p>
      )}
    </div>
  );
};

export default CategorySelector;
