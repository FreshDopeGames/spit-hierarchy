
import React from "react";
import { Button } from "@/components/ui/button";

interface BlogPostActionsProps {
  isEditing: boolean;
  isLoading: boolean;
  onCancel: () => void;
}

const BlogPostActions = ({ isEditing, isLoading, onCancel }: BlogPostActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
      <Button 
        type="submit" 
        disabled={isLoading}
        className="bg-rap-gold font-mogra text-black text-lg h-12 sm:h-11 flex-1 sm:flex-none"
      >
        {isLoading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="border-rap-smoke text-rap-smoke hover:border-rap-gold hover:text-rap-gold h-12 sm:h-11 flex-1 sm:flex-none"
      >
        Cancel
      </Button>
    </div>
  );
};

export default BlogPostActions;
