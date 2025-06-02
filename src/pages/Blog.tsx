
import { useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import InternalPageHeader from "@/components/InternalPageHeader";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  author_id: string;
  blog_categories?: {
    name: string;
  };
}

const POSTS_PER_PAGE = 6;

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch blog categories
  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('id, name, slug')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Infinite query for blog posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['blog-posts', selectedCategory],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          excerpt,
          featured_image_url,
          published_at,
          author_id,
          blog_categories(name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1);

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BlogPost[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === POSTS_PER_PAGE ? allPages.length : undefined;
    },
    initialPageParam: 0
  });

  const posts = data?.pages.flat() || [];

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
        <InternalPageHeader title="Sacred Scrolls" />
        <main className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-rap-platinum">Error loading blog posts. Please try again later.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <InternalPageHeader title="Sacred Scrolls" />
      
      <main className="max-w-6xl mx-auto p-6">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-ceviche text-rap-gold mb-4">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' 
                ? 'bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest text-rap-platinum' 
                : 'border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20'
              }
            >
              All Posts
            </Button>
            {categories?.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id 
                  ? 'bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest text-rap-platinum' 
                  : 'border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20'
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-carbon-fiber border border-rap-gold/40 animate-pulse">
                <div className="aspect-video bg-rap-carbon rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-rap-carbon rounded mb-2"></div>
                  <div className="h-6 bg-rap-carbon rounded mb-4"></div>
                  <div className="h-16 bg-rap-carbon rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Blog Posts Grid */}
        {!isLoading && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Card key={post.id} className="bg-carbon-fiber border border-rap-gold/40 overflow-hidden shadow-xl shadow-rap-gold/20 hover:shadow-rap-gold/40 transition-all duration-300 group">
                  <Link to={`/blog/${post.id}`}>
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.featured_image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop"} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-rap-smoke font-kaushan text-sm mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.published_at)}</span>
                      {post.blog_categories?.name && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="border-rap-forest text-rap-forest">
                            {post.blog_categories.name}
                          </Badge>
                        </>
                      )}
                    </div>
                    
                    <Link to={`/blog/${post.id}`}>
                      <h3 className="text-xl font-ceviche text-rap-platinum hover:text-rap-gold transition-colors cursor-pointer mb-3 leading-tight">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <p className="text-rap-silver font-kaushan leading-relaxed mb-4">
                      {post.excerpt || `${post.title.substring(0, 100)}...`}
                    </p>
                    
                    <Link to={`/blog/${post.id}`}>
                      <Button variant="outline" className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20 group">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra shadow-lg shadow-rap-gold/30"
                >
                  {isFetchingNextPage ? 'Loading More Sacred Scrolls...' : 'Load More Sacred Scrolls'}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-2xl font-ceviche text-rap-gold mb-4">No Sacred Scrolls Found</h3>
            <p className="text-rap-platinum font-kaushan">
              {selectedCategory === 'all' 
                ? "No published scrolls yet. Check back soon for wisdom from the temple!"
                : "No posts found in this category. Try selecting a different category."
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
