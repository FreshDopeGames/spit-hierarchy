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
      <AlertDialogContent className="bg-theme-background border border-theme-error/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-theme-text font-[var(--theme-font-heading)]">
            Delete Achievement
          </AlertDialogTitle>
          <AlertDialogDescription className="text-theme-textMuted">
            Are you sure you want to delete the achievement "{achievement.name}"? 
            This action cannot be undone and will affect all users who have earned this achievement.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-theme-surface border-theme-border text-theme-text hover:bg-theme-background"
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-theme-error hover:bg-theme-errorDark text-theme-white"
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