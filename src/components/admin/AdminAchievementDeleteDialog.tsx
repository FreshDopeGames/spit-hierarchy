import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tables } from "@/integrations/supabase/types";

type Achievement = Tables<"achievements">;

interface AdminAchievementDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: Achievement | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

const AdminAchievementDeleteDialog = ({
  open,
  onOpenChange,
  achievement,
  onConfirm,
  isDeleting
}: AdminAchievementDeleteDialogProps) => {
  if (!achievement) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-black border border-rap-burgundy/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-rap-platinum font-ceviche">
            Delete Achievement
          </AlertDialogTitle>
          <AlertDialogDescription className="text-rap-smoke">
            Are you sure you want to delete the achievement "{achievement.name}"? 
            This action cannot be undone and will affect all users who have earned this achievement.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-rap-carbon border-rap-gold/30 text-rap-platinum hover:bg-rap-carbon-light"
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-rap-burgundy hover:bg-rap-burgundy/80 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Achievement"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminAchievementDeleteDialog;