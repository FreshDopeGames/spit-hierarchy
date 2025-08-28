import React from "react";
import { ThemedButton } from "@/components/ui/themed-button";

interface BlogPostActionsProps {
  isEditing: boolean;
  isLoading: boolean;
  onCancel: () => void;
}

const BlogPostActions = ({ isEditing, isLoading, onCancel }: BlogPostActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
      <ThemedButton 
        type="submit" 
        disabled={isLoading}
        className="font-[var(--theme-font-heading)] text-lg h-12 sm:h-11 flex-1 sm:flex-none"
        variant="default"
      >
        {isLoading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
      </ThemedButton>
      <ThemedButton 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="h-12 sm:h-11 flex-1 sm:flex-none"
      >
        Cancel
      </ThemedButton>
    </div>
  );
};

export default BlogPostActions;