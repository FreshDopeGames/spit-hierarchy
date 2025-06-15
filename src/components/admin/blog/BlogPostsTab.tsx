
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import BlogPostList from "./BlogPostList";

interface BlogPostsTabProps {
  onEditPost: (post: any) => void;
  onNewPost: () => void;
}

const BlogPostsTab = ({ onEditPost, onNewPost }: BlogPostsTabProps) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch blog posts with author information
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      // First get the blog posts with category info
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories(name)
        `)
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;

      // Then get profiles for authors
      const authorIds = postsData?.map(post => post.author_id).filter(Boolean) || [];
      let profilesData = [];
      
      if (authorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .in('id', authorIds);
        
        if (profilesError) throw profilesError;
        profilesData = profiles || [];
      }

      // Combine the data
      const postsWithAuthors = postsData?.map(post => ({
        ...post,
        author_profile: profilesData.find(profile => profile.id === post.author_id)
      }));
      
      return postsWithAuthors;
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error('Error deleting post: ' + error.message);
    }
  });

  // Filter posts based on search
  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(postId);
    }
  };

  return (
    <Card className="bg-carbon-fiber border border-rap-gold/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-rap-platinum font-ceviche">Blog Posts</CardTitle>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
              <Input 
                placeholder="Search posts..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-10 bg-rap-carbon border-rap-smoke text-rap-platinum" 
              />
            </div>
            <Button 
              onClick={onNewPost} 
              className="bg-rap-gold font-mogra"
            >
              New Post
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BlogPostList
          posts={filteredPosts}
          isLoading={postsLoading}
          onEditPost={onEditPost}
          onDeletePost={handleDeletePost}
        />
      </CardContent>
    </Card>
  );
};

export default BlogPostsTab;
