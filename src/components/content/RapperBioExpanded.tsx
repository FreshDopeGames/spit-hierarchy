import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import ContentAdUnit from "@/components/ads/ContentAdUnit";
type Rapper = Tables<"rappers">;
interface RapperBioExpandedProps {
  rapper: Rapper;
}
const RapperBioExpanded = ({
  rapper
}: RapperBioExpandedProps) => {
  // Generate expanded content based on available rapper data
  const generateCareerHighlights = () => {
    if (!rapper.bio) return null;
    return ["Known for innovative lyricism and unique flow patterns", "Influential figure in the hip-hop community", "Recognized for contributions to rap culture and music", "Respected by peers and fans alike for artistic integrity"];
  };
  const generateCulturalImpact = () => {
    const impacts = ["Pioneering artist who helped shape modern hip-hop", "Influential voice in contemporary rap music", "Artist whose work resonates across generations", "Key figure in the evolution of hip-hop culture"];
    return impacts.slice(0, 2); // Show 2 impact points
  };
  const careerHighlights = generateCareerHighlights();
  const culturalImpact = generateCulturalImpact();
  if (!rapper.bio && !careerHighlights) return null;
  if (!rapper.bio) return null;
  return <div className="space-y-8">
      <Card className="bg-black border-rap-burgundy/40 px-0 my-[30px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-rap-platinum font-mogra">About {rapper.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="leading-relaxed font-kaushan text-rap-platinum text-lg">
            {rapper.bio}
          </p>
          
        </CardContent>
      </Card>

      {/* Ad Unit */}
      <ContentAdUnit size="medium" />
    </div>;
};
export default RapperBioExpanded;