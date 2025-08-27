
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
type Rapper = Tables<"rappers">;
interface RapperBioProps {
  rapper: Rapper;
}
const RapperBio = ({
  rapper
}: RapperBioProps) => {
  if (!rapper.bio) return null;
  return <Card className="bg-[var(--theme-surface)] border-[var(--theme-border)] mb-8">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-4 font-[var(--theme-fontPrimary)]">About</h2>
        <p className="leading-relaxed font-[var(--theme-fontSecondary)] text-[var(--theme-text)]">{rapper.bio}</p>
      </CardContent>
    </Card>;
};
export default RapperBio;
