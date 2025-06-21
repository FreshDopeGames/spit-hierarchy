
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  return (
    <div className="space-y-2">
      <Label htmlFor="category" className="text-rap-smoke font-kaushan">
        Attribute Category
      </Label>
      <Select value={categoryId} onValueChange={setCategoryId}>
        <SelectTrigger className="bg-rap-carbon/50 border-rap-gold/30 text-rap-platinum font-kaushan">
          <SelectValue placeholder="Select an attribute to rate..." />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
          {categories?.map((category) => (
            <SelectItem key={category.id} value={category.id} className="font-kaushan focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-100">
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedCategoryData && (
        <p className="text-sm text-rap-smoke font-kaushan">{selectedCategoryData.description}</p>
      )}
    </div>
  );
};

export default CategorySelector;
