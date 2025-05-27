
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface RapperBioProps {
  rapper: Rapper;
}

const RapperBio = ({ rapper }: RapperBioProps) => {
  if (!rapper.bio) return null;

  return (
    <Card className="bg-black/40 border-purple-500/20 mb-8">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-white mb-4">About</h2>
        <p className="text-gray-300 leading-relaxed">{rapper.bio}</p>
      </CardContent>
    </Card>
  );
};

export default RapperBio;
