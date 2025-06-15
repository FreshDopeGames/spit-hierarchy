
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BlogManagementHeaderProps {
  onNewPost: () => void;
}

const BlogManagementHeader = ({ onNewPost }: BlogManagementHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-mogra text-rap-gold">Blog Management</h2>
      <Button 
        onClick={onNewPost} 
        className="bg-rap-gold font-mogra"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Post
      </Button>
    </div>
  );
};

export default BlogManagementHeader;
