
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Crown, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTopRappersByCategory } from "@/hooks/useTopRappersByCategory";
import { useRapperImage } from "@/hooks/useImageStyle";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";
import { AvatarSkeleton, TextSkeleton } from "@/components/ui/skeleton";

// Extracted to file scope to prevent hook remount on every render
type AvatarSize = 'thumb' | 'medium' | 'large' | 'xlarge' | 'original';
const RapperAvatarItem = ({ rapperId, rapperName, size = 'thumb' }: { rapperId: string; rapperName: string; size?: AvatarSize }) => {
  const { data: imageUrl } = useRapperImage(rapperId, size);
  const placeholderImage = getOptimizedPlaceholder(size);
  const imageToDisplay = imageUrl && imageUrl.trim() !== "" ? imageUrl : placeholderImage;

  return (
    <img
      src={imageToDisplay}
      alt={rapperName}
      className="w-full h-full object-cover rounded-lg"
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (!target.src.includes(placeholderImage)) {
          target.src = placeholderImage;
        }
      }}
    />
  );
};

const FeaturedRapperCard = ({ rapper }: { rapper: any }) => (
  <Link
    to={`/rapper/${rapper.slug || rapper.rapper_id}`}
    className="block border border-rap-gold/20 rounded-lg p-4 hover:border-rap-gold/50 transition-all duration-200 cursor-pointer group bg-primary-foreground w-full"
    onClick={() => window.scrollTo(0, 0)}
  >
    <div className="flex flex-col items-center text-center gap-3">
      <div className="h-32 w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-rap-carbon to-rap-carbon-light border border-rap-gold/30 group-hover:border-rap-gold/50 transition-colors">
        <RapperAvatarItem rapperId={rapper.rapper_id} rapperName={rapper.rapper_name} size="medium" />
      </div>
      <div className="flex items-center justify-center gap-2">
        <Trophy className="w-4 h-4 text-rap-gold" />
        <span className="text-rap-platinum font-kaushan text-base group-hover:text-rap-gold transition-colors">
          {rapper.rapper_name}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Badge variant="outline" className="border-rap-gold/30 text-rap-gold text-xs">
          {rapper.average_rating?.toFixed(1)} avg
        </Badge>
        <span className="text-rap-platinum text-xs font-kaushan">
          {rapper.vote_count} ratings
        </span>
      </div>
    </div>
  </Link>
);

const CompactRapperCard = ({ rapper }: { rapper: any }) => (
  <Link
    to={`/rapper/${rapper.slug || rapper.rapper_id}`}
    className="block border border-rap-gold/20 rounded-lg p-3 hover:border-rap-gold/50 transition-all duration-200 cursor-pointer group bg-primary-foreground"
    onClick={() => window.scrollTo(0, 0)}
  >
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-rap-carbon to-rap-carbon-light border border-rap-gold/30 group-hover:border-rap-gold/50 transition-colors">
        <RapperAvatarItem rapperId={rapper.rapper_id} rapperName={rapper.rapper_name} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1">
          <span className="block text-rap-platinum font-kaushan text-sm group-hover:text-rap-gold transition-colors break-words leading-tight line-clamp-2">
            {rapper.rapper_name}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge variant="outline" className="border-rap-gold/30 text-rap-gold text-xs whitespace-nowrap">
            {rapper.average_rating?.toFixed(1)} avg
          </Badge>
          <span className="text-rap-platinum text-xs font-kaushan whitespace-nowrap">
            {rapper.vote_count} ratings
          </span>
        </div>
      </div>
    </div>
  </Link>
);

interface TopRappersByCategoryCardProps {
  countryCode?: string | null;
  region?: string | null;
}

const TopRappersByCategoryCard = ({ countryCode, region }: TopRappersByCategoryCardProps) => {
  const { data: topRappers, isLoading } = useTopRappersByCategory();

  if (isLoading) {
    return (
      <Card className="bg-black border-4 border-rap-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
            <Crown className="w-5 h-5" />
            Top Rappers by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-rap-smoke/20 rounded w-1/3"></div>
                <div className="flex flex-col gap-3">
                  <div className="w-full sm:max-w-md sm:mx-auto lg:max-w-sm border border-rap-gold/20 rounded-lg p-4">
                    <div className="flex flex-col items-center gap-3">
                      <AvatarSkeleton size="lg" className="h-32 w-32 rounded-lg" />
                      <TextSkeleton width="w-24" height="h-4" />
                      <TextSkeleton width="w-16" height="h-5" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="block bg-gray-800 border border-rap-gold/20 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <AvatarSkeleton size="lg" className="rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <TextSkeleton width="w-24" height="h-4" />
                            <TextSkeleton width="w-16" height="h-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-4 border-rap-gold/30">
      <CardHeader className="pb-3">
          <CardTitle className="text-[hsl(var(--theme-primary))] flex items-center gap-2 font-mogra">
            <Crown className="w-5 h-5" />
            Top Rappers by Category
          </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topRappers && Object.keys(topRappers).length > 0 ? (
            Object.entries(topRappers).map(([category, rappers]: [string, any]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-white font-mogra text-lg capitalize">
                  {category.replace(/_/g, ' ').replace('on beats', 'On Beats')}
                </h4>
                {(() => {
                  const list = (rappers || []).slice(0, 5);
                  const featured = list[0];
                  const rest = list.slice(1);
                  return (
                    <div className="flex flex-col gap-3">
                      {featured && (
                        <div className="w-full sm:max-w-md sm:mx-auto lg:max-w-sm">
                          <FeaturedRapperCard rapper={featured} />
                        </div>
                      )}
                      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                        {rest.map((rapper: any) => (
                          <CompactRapperCard key={rapper.rapper_id} rapper={rapper} />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))
          ) : (
            <div className="text-center text-rap-smoke font-kaushan">
              No voting data available yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopRappersByCategoryCard;
