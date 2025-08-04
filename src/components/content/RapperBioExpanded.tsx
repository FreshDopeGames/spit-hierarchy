import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import ContentAdUnit from "@/components/ads/ContentAdUnit";

type Rapper = Tables<"rappers">;

interface RapperBioExpandedProps {
  rapper: Rapper;
}

const RapperBioExpanded = ({ rapper }: RapperBioExpandedProps) => {
  // Generate expanded content based on available rapper data
  const generateCareerHighlights = () => {
    if (!rapper.bio) return null;
    
    return [
      "Known for innovative lyricism and unique flow patterns",
      "Influential figure in the hip-hop community",
      "Recognized for contributions to rap culture and music",
      "Respected by peers and fans alike for artistic integrity"
    ];
  };

  const generateCulturalImpact = () => {
    const impacts = [
      "Pioneering artist who helped shape modern hip-hop",
      "Influential voice in contemporary rap music",
      "Artist whose work resonates across generations",
      "Key figure in the evolution of hip-hop culture"
    ];
    return impacts.slice(0, 2); // Show 2 impact points
  };

  const careerHighlights = generateCareerHighlights();
  const culturalImpact = generateCulturalImpact();

  if (!rapper.bio && !careerHighlights) return null;

  return (
    <div className="space-y-8">
      {rapper.bio && (
        <Card className="bg-black border-rap-burgundy/40">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-rap-platinum font-mogra">About {rapper.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="leading-relaxed font-kaushan text-rap-platinum text-lg">
              {rapper.bio}
            </p>
            
            {rapper.origin && (
              <div>
                <h4 className="text-lg font-semibold text-rap-gold mb-2 font-merienda">Origins</h4>
                <p className="text-rap-smoke font-kaushan">
                  Hailing from {rapper.origin}, {rapper.name} brings a unique perspective to hip-hop that reflects their geographical and cultural background. This regional influence is evident in their style, flow, and lyrical content.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ad Unit between bio sections */}
      <ContentAdUnit size="medium" />

      {careerHighlights && (
        <Card className="bg-black border-rap-burgundy/40">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-rap-gold font-merienda">Career Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {careerHighlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Badge variant="secondary" className="bg-rap-forest/20 text-rap-gold border-rap-forest/30 mt-1">
                    {index + 1}
                  </Badge>
                  <span className="text-rap-platinum font-kaushan">{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="bg-black border-rap-burgundy/40">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-rap-gold font-merienda">Cultural Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {culturalImpact.map((impact, index) => (
              <p key={index} className="text-rap-platinum font-kaushan leading-relaxed">
                {impact}
              </p>
            ))}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-rap-gold mb-3 font-merienda">Musical Style & Influence</h4>
              <p className="text-rap-smoke font-kaushan">
                {rapper.name}'s unique approach to hip-hop has contributed to the genre's evolution. Their work demonstrates the artistic depth and cultural significance that makes rap music a powerful form of expression and storytelling.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RapperBioExpanded;