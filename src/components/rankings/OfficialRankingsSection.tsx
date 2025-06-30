
import { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import RankingCard from "./RankingCard";
import { RankingWithItems } from "@/types/rankings";
import { transformOfficialRankings } from "@/utils/rankingTransformers";

interface OfficialRankingsSectionProps {
  rankings?: RankingWithItems[];
}

const OfficialRankingsSection = ({
  rankings = []
}: OfficialRankingsSectionProps) => {
  const [transformedRankings, setTransformedRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Transform rankings when data changes
  useEffect(() => {
    if (rankings.length > 0) {
      setLoading(true);
      transformOfficialRankings(rankings).then(transformed => {
        setTransformedRankings(transformed);
        setLoading(false);
      });
    }
  }, [rankings]);

  // Show loading state or empty state if no rankings
  if (rankings.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-black via-rap-carbon to-rap-charcoal border-rap-gold/30">
        <CardContent className="p-8 text-center">
          <Award className="w-12 h-12 text-rap-gold mx-auto mb-4" />
          <h3 className="text-xl font-mogra text-rap-platinum mb-2">
            Official Rankings
          </h3>
          <p className="text-rap-smoke font-merienda mb-4">
            Our official editorial rankings are being prepared. Check back soon for comprehensive lists curated by our expert team.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-rap-platinum font-merienda">
          Loading official rankings...
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-rap-gold flex-shrink-0" />
        <h2 className="text-2xl sm:text-3xl font-bold text-rap-platinum font-mogra">Official Rankings</h2>
        <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold border-rap-gold/30 font-kaushan text-xs sm:text-sm">
          Editorial Curated
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {transformedRankings.map(ranking => (
          <RankingCard key={ranking.id} ranking={ranking} isUserRanking={false} />
        ))}
      </div>
    </div>
  );
};

export default OfficialRankingsSection;
