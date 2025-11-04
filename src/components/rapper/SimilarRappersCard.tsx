import { useSimilarRappers } from "@/hooks/useSimilarRappers";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import RapperCard from "@/components/RapperCard";
import RapperGridSkeleton from "@/components/RapperGridSkeleton";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { getRapperImageUrl } from "@/hooks/useImageStyle";

interface SimilarRappersCardProps {
  rapperId: string;
}

const SimilarRappersCard = ({
  rapperId
}: SimilarRappersCardProps) => {
  const {
    similarRappers,
    isLoading: rappersLoading,
    error
  } = useSimilarRappers(rapperId);

  // Batch fetch all rapper images in a single query - use 'thumb' size for compact cards
  const rapperIds = similarRappers?.map(r => r.id) || [];
  const { data: rapperImages, isLoading: imagesLoading } = useQuery({
    queryKey: ["similar-rapper-images", rapperIds, "thumb"],
    queryFn: async () => {
      if (rapperIds.length === 0) return {};
      
      const { data } = await supabase
        .from("rapper_images")
        .select("rapper_id, image_url, style")
        .in("rapper_id", rapperIds)
        .eq("style", "comic_book");

      // Create a map of rapper_id to optimized thumb-size image URLs
      return (data || []).reduce((acc, img) => {
        if (img.image_url.startsWith('http')) {
          // Legacy full URL
          acc[img.rapper_id] = img.image_url;
        } else {
          // Construct optimized thumb URL (128px)
          acc[img.rapper_id] = getRapperImageUrl(img.image_url, 'thumb');
        }
        return acc;
      }, {} as Record<string, string>);
    },
    enabled: rapperIds.length > 0,
  });

  const isLoading = rappersLoading || imagesLoading;

  if (error) {
    console.error("Error loading similar rappers:", error);
    return null;
  }

  return (
    <ThemedCard variant="dark" className="w-full border-[4px] border-[hsl(var(--theme-primary))]">
      <ThemedCardHeader>
        <ThemedCardTitle className="font-mogra text-2xl">You Might Rock With...</ThemedCardTitle>
        <p className="text-sm text-muted-foreground font-merienda mt-1">
          Rappers with 3+ shared tags
        </p>
      </ThemedCardHeader>
      <ThemedCardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <RapperGridSkeleton key={index} />
            ))}
          </div>
        ) : similarRappers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {similarRappers.map(rapper => (
              <RapperCard 
                key={rapper.id} 
                rapper={rapper} 
                imageUrl={rapperImages?.[rapper.id]} 
                stats={{
                  top5_count: rapper.top5_count || 0,
                  ranking_votes: rapper.ranking_votes || 0
                }} 
                compact={true} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground font-merienda">
            No similar rappers found
          </div>
        )}
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default SimilarRappersCard;
