import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
type Rapper = Tables<"rappers">;
interface RapperBioExpandedProps {
  rapper: Rapper;
}
const RapperBioExpanded = ({
  rapper
}: RapperBioExpandedProps) => {
  if (!rapper.bio) return null;
  return <div className="space-y-8">
      <Card className="bg-black border-4 border-[hsl(var(--theme-primary))] px-0 my-[30px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-rap-platinum font-mogra">About {rapper.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="leading-relaxed font-merienda text-rap-platinum text-lg">
            {rapper.bio}
          </p>
        </CardContent>
      </Card>
    </div>;
};
export default RapperBioExpanded;