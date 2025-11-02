import { useSimilarRappers } from "@/hooks/useSimilarRappers";
import { useRapperImage } from "@/hooks/useImageStyle";
import RapperCard from "@/components/RapperCard";
import RapperGridSkeleton from "@/components/RapperGridSkeleton";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
interface SimilarRappersCardProps {
  rapperId: string;
}
const SimilarRappersCard = ({
  rapperId
}: SimilarRappersCardProps) => {
  const {
    similarRappers,
    isLoading,
    error
  } = useSimilarRappers(rapperId);
  if (error) {
    console.error("Error loading similar rappers:", error);
    return null;
  }
  return <ThemedCard variant="dark" className="w-full border-[4px] border-[hsl(var(--theme-primary))]">
      <ThemedCardHeader>
        <ThemedCardTitle className="font-mogra text-2xl">You Might Rock With...</ThemedCardTitle>
        <p className="text-sm text-muted-foreground font-merienda mt-1">
          Rappers with 3+ shared tags
        </p>
      </ThemedCardHeader>
      <ThemedCardContent>
        {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => <RapperGridSkeleton key={index} />)}
          </div> : similarRappers.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {similarRappers.map(rapper => <SimilarRapperCard key={rapper.id} rapper={rapper} />)}
          </div> : <div className="text-center py-8 text-muted-foreground font-merienda">
            No similar rappers found
          </div>}
      </ThemedCardContent>
    </ThemedCard>;
};

// Wrapper component to handle image loading for each similar rapper
const SimilarRapperCard = ({
  rapper
}: {
  rapper: any;
}) => {
  const {
    data: imageUrl
  } = useRapperImage(rapper.id, 'medium');
  return <RapperCard rapper={rapper} imageUrl={imageUrl} stats={{
    top5_count: rapper.top5_count || 0,
    ranking_votes: rapper.ranking_votes || 0
  }} compact={true} />;
};
export default SimilarRappersCard;