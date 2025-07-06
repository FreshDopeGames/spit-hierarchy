
import React from "react";
import AdminTabHeader from "../AdminTabHeader";
import { PenTool } from "lucide-react";

const BlogManagementHeader = () => {
  return (
    <AdminTabHeader 
      title="Blog Management" 
      icon={PenTool}
      description="Create and manage blog posts and categories"
    />
  );
};

export default BlogManagementHeader;
