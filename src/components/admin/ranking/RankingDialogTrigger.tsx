
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type OfficialRanking = Tables<"official_rankings">;

interface RankingDialogTriggerProps {
  ranking?: OfficialRanking;
}

const RankingDialogTrigger = ({ ranking }: RankingDialogTriggerProps) => {
  return (
    <DialogTrigger asChild>
      {ranking ? (
        <Button variant="outline" size="sm">
          Edit
        </Button>
      ) : (
        <Button className="bg-rap-gold text-rap-carbon hover:bg-white hover:text-rap-gold-dark">
          <Plus className="w-4 h-4 mr-2" />
          Add Ranking
        </Button>
      )}
    </DialogTrigger>
  );
};

export default RankingDialogTrigger;
