import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MentionedRapper {
  id: string;
  name: string;
  slug: string;
}

/**
 * Extracts rapper slugs from markdown links in blog content
 * Matches patterns like [Rapper Name](/rapper/rapper-slug)
 */
const extractRapperSlugsFromContent = (content: string): string[] => {
  const rapperLinkRegex = /\[([^\]]+)\]\(\/rapper\/([^)]+)\)/g;
  const slugs: string[] = [];
  let match;
  
  while ((match = rapperLinkRegex.exec(content)) !== null) {
    const slug = match[2];
    if (slug && !slugs.includes(slug)) {
      slugs.push(slug);
    }
  }
  
  return slugs;
};

/**
 * Hook to extract and fetch rappers mentioned in blog post content
 */
export const useMentionedRappers = (content: string | undefined) => {
  const slugs = content ? extractRapperSlugsFromContent(content) : [];
  
  return useQuery({
    queryKey: ["mentioned-rappers", slugs.sort().join(",")],
    queryFn: async (): Promise<MentionedRapper[]> => {
      if (slugs.length === 0) return [];
      
      const { data, error } = await supabase
        .from("rappers")
        .select("id, name, slug")
        .in("slug", slugs);
      
      if (error) throw error;
      
      // Maintain the order from the content (first mention first)
      const orderedRappers = slugs
        .map(slug => data?.find(r => r.slug === slug))
        .filter((r): r is MentionedRapper => r !== undefined);
      
      return orderedRappers;
    },
    enabled: slugs.length > 0,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
};

export type { MentionedRapper };
