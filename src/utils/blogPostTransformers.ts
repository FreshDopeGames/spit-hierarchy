
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  author_id: string;
  category_id: string;
  blog_categories?: {
    name: string;
  };
  blog_post_tags?: Array<{
    blog_tags: {
      name: string;
      slug: string;
    };
  }>;
}

interface RelatedPostData {
  id: string;
  title: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
}

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMMM d, yyyy');
  } catch {
    return 'Unknown date';
  }
};

export const transformBlogPost = (blogPost: BlogPost) => {
  return {
    title: blogPost.title,
    tags: blogPost.blog_post_tags?.map(pt => pt.blog_tags.name) || [],
    author: "Temple Scribe",
    timeAgo: formatDate(blogPost.published_at),
    readTime: "5 min read",
    featured_image_url: blogPost.featured_image_url
  };
};

export const transformRelatedPosts = (relatedPosts: RelatedPostData[]) => {
  return relatedPosts?.map(post => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || `${post.title.substring(0, 100)}...`,
    imageUrl: post.featured_image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
    timeAgo: formatDate(post.published_at)
  })) || [];
};
