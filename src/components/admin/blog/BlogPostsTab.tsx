import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
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
          .rpc('search_profiles_admin', { search_term: '' });
        
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
    <ThemedCard>
      <ThemedCardHeader>
        <ThemedCardTitle className="mb-4 text-center text-2xl">Blog Posts</ThemedCardTitle>
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-textMuted)] w-4 h-4" />
            <Input 
              placeholder="Search posts..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)]" 
            />
          </div>
          <ThemedButton 
            onClick={onNewPost} 
            className="font-[var(--theme-font-heading)] ml-4"
            variant="default"
          >
            New Post
          </ThemedButton>
        </div>
      </ThemedCardHeader>
      <ThemedCardContent>
        <BlogPostList
          posts={filteredPosts}
          isLoading={postsLoading}
          onEditPost={onEditPost}
          onDeletePost={handleDeletePost}
        />
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogPostsTab;