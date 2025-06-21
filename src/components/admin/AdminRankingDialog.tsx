
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { rankingFormSchema, RankingFormData } from "./ranking/rankingFormSchema";
import RankingFormFields from "./ranking/RankingFormFields";
import RankingDialogTrigger from "./ranking/RankingDialogTrigger";
import { useRankingSubmission } from "./ranking/useRankingSubmission";

type OfficialRanking = Tables<"official_rankings">;

interface AdminRankingDialogProps {
  onRankingCreated: () => void;
  ranking?: OfficialRanking;
}

const AdminRankingDialog = ({
  onRankingCreated,
  ranking
}: AdminRankingDialogProps) => {
  const [open, setOpen] = useState(false);

  const form = useForm<RankingFormData>({
    resolver: zodResolver(rankingFormSchema),
    defaultValues: {
      title: ranking?.title || "",
      description: ranking?.description || "",
      category: ranking?.category || "",
      slug: ranking?.slug || ""
    }
  });

  const { onSubmit, isLoading } = useRankingSubmission({
    ranking,
    onRankingCreated,
    form,
    setOpen
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <RankingDialogTrigger ranking={ranking} />
      <DialogContent className="bg-rap-carbon border-rap-gold/20 text-rap-platinum sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mogra text-rap-gold">
            {ranking ? "Edit Ranking" : "Create New Ranking"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <RankingFormFields form={form} />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-charcoal"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-rap-gold hover:bg-rap-gold-light text-rap-charcoal font-mogra"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {ranking ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminRankingDialog;
