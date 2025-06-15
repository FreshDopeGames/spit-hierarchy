
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";

interface BlogPostListProps {
  posts: any[] | undefined;
  isLoading: boolean;
  onEditPost: (post: any) => void;
  onDeletePost: (postId: string) => void;
}

const BlogPostList = ({ posts, isLoading, onEditPost, onDeletePost }: BlogPostListProps) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      published: "default", 
      archived: "outline"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (isLoading) {
    return <div className="text-rap-smoke">Loading posts...</div>;
  }

  return (
    <div className="space-y-4">
      {posts?.map(post => (
        <div key={post.id} className="border border-rap-smoke/30 rounded-lg p-4 hover:border-rap-gold/50 transition-colors">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-rap-platinum mb-2">{post.title}</h3>
              <div className="flex items-center gap-4 text-sm text-rap-smoke mb-2">
                <span>By: {post.author_profile?.full_name || post.author_profile?.username || 'Unknown'}</span>
                <span>Category: {post.blog_categories?.name || 'Uncategorized'}</span>
                <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(post.status)}
                {post.featured && <Badge className="bg-rap-gold text-rap-carbon">Featured</Badge>}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`/blog/${post.id}`, '_blank')}
                className="border-rap-smoke text-rap-smoke hover:border-rap-gold hover:text-rap-gold"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditPost(post)}
                className="border-rap-smoke text-rap-smoke hover:border-rap-gold hover:text-rap-gold"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDeletePost(post.id)}
                className="border-red-500 text-red-500 hover:border-red-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogPostList;
