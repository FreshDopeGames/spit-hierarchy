import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AchievementForm from "./forms/AchievementForm";
import { Tables } from "@/integrations/supabase/types";

type Achievement = Tables<"achievements">;

interface AdminAchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement?: Achievement | null;
  onSuccess: () => void;
}

const AdminAchievementDialog = ({
  open,
  onOpenChange,
  achievement,
  onSuccess
}: AdminAchievementDialogProps) => {
  const handleClose = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--theme-background)] border border-[var(--theme-border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] text-xl">
            {achievement ? `Edit ${achievement.name}` : "Add New Achievement"}
          </DialogTitle>
        </DialogHeader>
        
        <AchievementForm 
          achievement={achievement} 
          onSuccess={handleClose} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default AdminAchievementDialog;