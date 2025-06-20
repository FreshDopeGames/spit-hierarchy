
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface RapperBioProps {
  rapper: Rapper;
}

const RapperBio = ({ rapper }: RapperBioProps) => {
  if (!rapper.bio) return null;

  return (
    <Card className="bg-carbon-fiber border-rap-burgundy/40 mb-8">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-rap-platinum mb-4 font-mogra">About</h2>
        <p className="text-rap-smoke leading-relaxed font-kaushan">{rapper.bio}</p>
      </CardContent>
    </Card>
  );
};

export default RapperBio;
