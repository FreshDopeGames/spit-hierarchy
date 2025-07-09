
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
import { Loader2, AlertTriangle } from "lucide-react";

type Rapper = Tables<"rappers">;

interface AdminRapperDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rapper: Rapper | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

const AdminRapperDeleteDialog = ({
  open,
  onOpenChange,
  rapper,
  onConfirm,
  isDeleting
}: AdminRapperDeleteDialogProps) => {
  if (!rapper) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-rap-carbon border-rap-gold/30">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rap-burgundy" />
            <AlertDialogTitle className="text-rap-platinum">
              Delete Rapper
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-rap-smoke">
            Are you sure you want to delete <strong className="text-rap-gold">{rapper.name}</strong>? 
            This action cannot be undone and will remove all associated data including votes, 
            rankings, and statistics.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isDeleting}
            className="border-rap-smoke text-rap-platinum hover:bg-rap-smoke/20"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-rap-burgundy hover:bg-rap-burgundy/80 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Rapper"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminRapperDeleteDialog;
