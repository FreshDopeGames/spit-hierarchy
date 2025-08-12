import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Disc3, Music, Calendar, Trophy, Building2 } from "lucide-react";
import { useRapperCareerStats } from "@/hooks/useRapperDiscography";
interface CareerStatsCardProps {
  rapperId: string;
}
const CareerStatsCard = ({
  rapperId
}: CareerStatsCardProps) => {
  const {
    data: stats,
    isLoading
  } = useRapperCareerStats(rapperId);
  if (isLoading) {
    return <Card className="bg-black border-rap-gold/20 animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-rap-carbon-light rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="text-center space-y-2">
                  <div className="h-8 bg-rap-carbon-light rounded w-full"></div>
                  <div className="h-4 bg-rap-carbon-light rounded w-3/4 mx-auto"></div>
                </div>)}
            </div>
          </div>
        </CardContent>
      </Card>;
  }
  if (!stats) return null;
  const statItems = [{
    icon: Disc3,
    label: "Albums",
    value: stats.totalAlbums,
    color: "text-rap-gold"
  }, {
    icon: Music,
    label: "Mixtapes",
    value: stats.totalMixtapes,
    color: "text-rap-burgundy"
  }, {
    icon: Calendar,
    label: "Career Span",
    value: stats.careerSpan > 0 ? `${stats.careerSpan} yrs` : "N/A",
    color: "text-rap-platinum"
  }];
  return <Card className="bg-black border-rap-gold/20 shadow-lg shadow-rap-gold/10">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-mogra text-rap-platinum">Career Overview</h3>
            {!stats.hasMusicBrainzId && <Badge variant="secondary" className="text-xs">
                Limited Data
              </Badge>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statItems.map((item, index) => <div key={index} className={`text-center space-y-2 ${index === 2 ? 'col-span-2 md:col-span-1' : ''}`}>
                <div className="flex items-center justify-center">
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className={`text-2xl font-bold font-mogra ${item.color}`}>
                  {item.value}
                </div>
                <div className="text-sm text-rap-smoke font-kaushan">
                  {item.label}
                </div>
              </div>)}
          </div>

          {stats.careerStartYear && <div className="mt-4 p-3 bg-rap-carbon/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-rap-smoke font-kaushan justify-center ">
                <Calendar className="w-4 h-4" />
                <span>
                  Active: {stats.careerStartYear}
                  {stats.careerEndYear ? ` - ${stats.careerEndYear}` : ' - Current'}
                  {stats.isDeceased && <span className="ml-2 text-xs">✝</span>}
                </span>
              </div>
            </div>}

          {stats.labelAffiliations.length > 0 && <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-rap-smoke font-kaushan">
                <Building2 className="w-4 h-4" />
                <span>Record Labels:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.labelAffiliations.slice(0, 3).map((affiliation, index) => <Badge key={index} variant="outline" className="text-xs border-rap-gold/50 text-rap-gold">
                    {affiliation.label?.name}
                    {affiliation.is_current && <span className="ml-1 text-green-400">●</span>}
                  </Badge>)}
                {stats.labelAffiliations.length > 3 && <Badge variant="outline" className="text-xs border-rap-smoke/50 text-rap-smoke">
                    +{stats.labelAffiliations.length - 3} more
                  </Badge>}
              </div>
            </div>}
        </div>
      </CardContent>
    </Card>;
};
export default CareerStatsCard;