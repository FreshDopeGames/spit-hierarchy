
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTopRappersByCategory } from "@/hooks/useTopRappersByCategory";
import { useRapperImage } from "@/hooks/useImageStyle";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";

const TopRappersByCategoryCard = () => {
  const { data: topRappers, isLoading } = useTopRappersByCategory();

  if (isLoading) {
    return (
      <Card className="bg-black border-rap-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-rap-gold flex items-center gap-2 font-mogra">
            <Crown className="w-5 h-5" />
            Top Rappers by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-rap-smoke/20 rounded w-1/3"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-16 bg-rap-smoke/20 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-rap-gold/30">
      <CardHeader className="pb-3">
          <CardTitle className="text-rap-gold flex items-center gap-2 font-mogra">
            <Crown className="w-5 h-5" />
            Top Rappers by Category
          </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topRappers && Object.keys(topRappers).length > 0 ? (
            Object.entries(topRappers).map(([category, rappers]: [string, any]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-rap-gold font-mogra text-lg capitalize">
                  {category.replace(/_/g, ' ').replace('on beats', 'On Beats')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {(rappers || []).slice(0, 5).map((rapper: any, index: number) => {
                    const RapperAvatarItem = ({ rapper }: { rapper: any }) => {
                      const { data: imageUrl } = useRapperImage(rapper.rapper_id, 'thumb');
                      const placeholderImage = getOptimizedPlaceholder('thumb');
                      const imageToDisplay = imageUrl && imageUrl.trim() !== "" ? imageUrl : placeholderImage;

                      return (
                        <img 
                          src={imageToDisplay}
                          alt={rapper.rapper_name} 
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

                    return (
                      <Link 
                        key={rapper.rapper_id} 
                        to={`/rapper/${rapper.slug || rapper.rapper_id}`}
                        className="block bg-gray-800 border border-rap-gold/20 rounded-lg p-3 hover:border-rap-gold/50 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer group"
                        onClick={() => window.scrollTo(0, 0)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-rap-carbon to-rap-carbon-light border border-rap-gold/30 group-hover:border-rap-gold/50 transition-colors">
                             <RapperAvatarItem rapper={rapper} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {index === 0 && <Trophy className="w-4 h-4 text-rap-gold" />}
                              <span className="text-rap-platinum font-kaushan text-sm group-hover:text-rap-gold transition-colors">
                                {rapper.rapper_name}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="border-rap-gold/30 text-rap-gold text-xs">
                                {rapper.average_rating?.toFixed(1)} avg
                              </Badge>
                              <span className="text-rap-platinum text-xs font-kaushan">
                                {rapper.vote_count} votes
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
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
